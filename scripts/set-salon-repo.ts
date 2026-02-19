/**
 * Update a salon's GitHub repo config (repoName, filePath).
 * Usage: npm run salon:config -- <salonId> <repoName> <filePath>
 * Example: npm run salon:config -- 69958a5477e79544db8671f8 demo2-website-nails config/site.json
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const SalonSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    phone: String,
    address: String,
    repoName: String,
    filePath: String,
  },
  { timestamps: true, collection: 'salons' },
);

const [,, salonId, repoName, filePath] = process.argv;

if (!salonId || !repoName || !filePath) {
  console.error('Usage: npm run salon:config -- <salonId> <repoName> <filePath>');
  console.error('Example: npm run salon:config -- 6990877dbad66eaac0499fce Demo-website-nails config/site.json');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

async function main() {
  const Salon = mongoose.models.Salon ?? mongoose.model('Salon', SalonSchema);

  const result = await Salon.findByIdAndUpdate(
    salonId,
    { $set: { repoName, filePath, updatedAt: new Date() } },
    { new: true },
  ).exec();

  if (!result) {
    console.error(`Salon not found for _id: ${salonId}`);
    process.exit(1);
  }

  console.log('Salon repo config updated:');
  console.log('  _id:', result._id.toString());
  console.log('  repoName:', result.repoName);
  console.log('  filePath:', result.filePath);
}

mongoose
  .connect(uri)
  .then(() => main())
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
