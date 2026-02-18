import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly token: string;
  private readonly owner: string;
  private readonly apiBase = 'https://api.github.com';

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('GITHUB_TOKEN') ?? '';
    this.owner = this.configService.get<string>('GITHUB_OWNER') ?? '';
  }

  private ensureConfig(): void {
    if (!this.token || !this.owner) {
      throw new InternalServerErrorException(
        'GITHUB_TOKEN and GITHUB_OWNER must be set in environment for content updates',
      );
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * GET file content from GitHub repo.
   * Returns { content (decoded string), sha }.
   */
  async getFileContent(
    repoName: string,
    filePath: string,
  ): Promise<{ content: string; sha: string }> {
    this.ensureConfig();
    const url = `${this.apiBase}/repos/${this.owner}/${repoName}/contents/${filePath}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`GitHub GET failed [${response.status}]: ${body}`);
      throw new InternalServerErrorException(
        'Failed to fetch content from GitHub',
      );
    }

    const data: GitHubFileResponse = await response.json();
    const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content: decoded, sha: data.sha };
  }

  /**
   * PUT (update) file content in GitHub repo.
   */
  async updateFileContent(
    repoName: string,
    filePath: string,
    content: string,
    sha: string,
    message: string,
  ): Promise<void> {
    this.ensureConfig();
    const url = `${this.apiBase}/repos/${this.owner}/${repoName}/contents/${filePath}`;
    const encoded = Buffer.from(content, 'utf-8').toString('base64');

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        content: encoded,
        sha,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`GitHub PUT failed [${response.status}]: ${body}`);
      throw new InternalServerErrorException(
        'Failed to update content on GitHub',
      );
    }
  }
}
