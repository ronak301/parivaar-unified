/**
 * Restore Ronak & Roshanlal's profile data from backup.sql
 * Relationships stay as-is.
 *
 * Usage: npx tsx src/scripts/cleanup-migration.ts
 */

import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';

dotenv.config();

import User from '../models/User';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected\n');

  try {
    // Roshanlal
    await User.updateOne(
      { _id: new Types.ObjectId('6a9ff8686cb06401415c188e') },
      {
        $set: {
          firstName: 'Roshanlal',
          lastName: 'Kothari',
          fullName: 'Roshanlal Kothari',
          profilePicture:
            'https://firebasestorage.googleapis.com/v0/b/parivaar-b9150.appspot.com/o/user%2F%20%2B%20Wed%20Sep%2020%202023%2018%3A33%3A32%20GMT%2B0530?alt=media&token=ac390ebc-bc2d-4879-b507-19e8fe72cb51',
          guardianName: 'Late Magni ram Kothari',
          dob: new Date('1955-02-04'),
          gender: 'Male',
          education: '12th',
          nativePlace: 'Bagad (Bhilwara district)',
          weddingDate: new Date('1978-12-08'),
          bloodGroup: 'A_POSITIVE',
          isMarried: true,
          isAlive: true,
          isFamilyHead: true,
          address: {
            fullAddress: '6, Tilak nagar hiran magri, sector 3, udaipur',
            city: 'Udaipur',
            locality: 'Hiran Magri Sector 3',
            state: 'Rajasthan',
          },
        },
      },
    );
    console.log('Updated Roshanlal Kothari');

    // Ronak
    await User.updateOne(
      { _id: new Types.ObjectId('6a9ffa1e667e6834d704b5bd') },
      {
        $set: {
          firstName: 'Ronak',
          lastName: 'Kothari',
          fullName: 'Ronak Kothari',
          profilePicture:
            'https://firebasestorage.googleapis.com/v0/b/parivaar-b9150.appspot.com/o/user%2F%20%2B%20Sat%20Sep%2030%202023%2001%3A01%3A27%20GMT%2B0530?alt=media&token=bfd5b377-5472-46dd-9374-143aec6120f6',
          guardianName: 'Shri Roshan lal Ji kothari',
          dob: new Date('1992-03-22'),
          gender: 'Male',
          education: 'B.Tech',
          nativePlace: 'Vagad',
          weddingDate: new Date('2019-11-08'),
          email: 'ronakkothari301@gmail.com',
          bloodGroup: 'B_POSITIVE',
          isMarried: true,
          isAlive: true,
          isFamilyHead: false,
          address: {
            fullAddress: '6, Tikal nagar, Hiram Margi sector 3',
            city: 'Udaipur',
            locality: 'Hiran Magri Sector 3',
            state: 'Rajasthan',
          },
        },
      },
    );
    console.log('Updated Ronak Kothari');

    // Verify
    console.log('\n=== Verification ===');
    for (const id of ['6a9ff8686cb06401415c188e', '6a9ffa1e667e6834d704b5bd']) {
      const u = await User.findById(id).lean();
      if (!u) continue;
      console.log(`\n${u.fullName}: guardian=${u.guardianName}, edu=${u.education}, dob=${u.dob}, blood=${u.bloodGroup}, native=${u.nativePlace}`);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDone.');
  }
}

main().catch(console.error);
