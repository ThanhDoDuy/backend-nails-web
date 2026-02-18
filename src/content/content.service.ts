import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GitHubService } from './github.service.js';
import { SalonsService } from '../salons/salons.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ContentService {
  constructor(
    private readonly githubService: GitHubService,
    private readonly salonsService: SalonsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Fetch site config from the salon's GitHub repo (e.g. config/site.json or data/content.json).
   */
  async getContent(userId: string, salonId: string): Promise<object> {
    const { repoName, filePath } = await this.resolveSalonRepo(salonId);

    const { content } = await this.githubService.getFileContent(
      repoName,
      filePath,
    );

    try {
      return JSON.parse(content);
    } catch {
      throw new BadRequestException(
        'Content file is not valid JSON in the repository',
      );
    }
  }

  /**
   * Update site config in the salon's GitHub repo.
   * Merges request body with current file; gallery is preserved from repo (not updatable via admin).
   * Vercel auto-deploys on commit.
   */
  async updateContent(
    userId: string,
    salonId: string,
    newContent: object,
  ): Promise<{ success: true }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { repoName, filePath } = await this.resolveSalonRepo(salonId);

    const { content: currentRaw, sha } =
      await this.githubService.getFileContent(repoName, filePath);

    let current: object;
    try {
      current = JSON.parse(currentRaw) as object;
    } catch {
      throw new BadRequestException(
        'Content file is not valid JSON in the repository',
      );
    }

    const merged = { ...current, ...newContent } as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(current, 'gallery')) {
      merged.gallery = (current as Record<string, unknown>).gallery;
    }

    const formatted = JSON.stringify(merged, null, 2) + '\n';
    const commitMessage = `Update site content by ${user.email}`;

    await this.githubService.updateFileContent(
      repoName,
      filePath,
      formatted,
      sha,
      commitMessage,
    );

    return { success: true };
  }

  private async resolveSalonRepo(
    salonId: string,
  ): Promise<{ repoName: string; filePath: string }> {
    const salon = await this.salonsService.findById(salonId);
    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    if (!salon.repoName) {
      throw new BadRequestException(
        'Salon does not have a GitHub repo configured. Set repoName and filePath (e.g. config/site.json) for this salon.',
      );
    }

    return {
      repoName: salon.repoName,
      filePath: salon.filePath ?? 'data/content.json',
    };
  }
}
