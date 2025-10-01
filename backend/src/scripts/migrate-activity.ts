import mongoose from 'mongoose';
import User from '../models/User';
import Issue from '../models/Issue';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issue-tracker';

async function migrateActivityData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      // Count issues created by this user
      const issuesCreated = await Issue.countDocuments({ createdBy: user._id });
      
      // Count issues resolved by this user (where they responded)
      const issuesResolved = await Issue.countDocuments({ 
        'response.respondedBy': user._id 
      });

      // Update user with activity data
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'activity.totalLogins': user.activity?.totalLogins || 0,
          'activity.issuesCreated': issuesCreated,
          'activity.issuesResolved': issuesResolved,
          'activity.lastActivity': user.activity?.lastActivity || new Date()
        }
      });

      console.log(`Updated user ${user.email}: ${issuesCreated} created, ${issuesResolved} resolved`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateActivityData();
