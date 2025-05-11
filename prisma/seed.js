const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean existing data
  await prisma.savedPost.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users with plain text passwords
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        subscription: 'premium',
        generationsLeft: 999,
        generationsTotal: 999,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Premium User',
        email: 'premium@example.com',
        password: 'password123',
        role: 'user',
        subscription: 'premium',
        generationsLeft: 100,
        generationsTotal: 100,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Free User',
        email: 'free@example.com',
        password: 'password123',
        role: 'user',
        subscription: 'free',
        generationsLeft: 12,
        generationsTotal: 20,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=free',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create collections for each user
  const collections = [];
  
  for (const user of users) {
    const userCollections = await Promise.all([
      prisma.collection.create({
        data: {
          name: `${user.name}'s Favorites`,
          description: 'My favorite posts',
          userId: user.id,
        },
      }),
      prisma.collection.create({
        data: {
          name: `${user.name}'s Drafts`,
          description: 'Works in progress',
          userId: user.id,
        },
      }),
    ]);
    
    collections.push(...userCollections);
  }

  console.log(`Created ${collections.length} collections`);

  // Create posts for each user
  const posts = [];
  
  for (const user of users) {
    const userCollections = collections.filter(c => c.userId === user.id);
    
    const userPosts = await Promise.all([
      prisma.post.create({
        data: {
          title: `${user.name}'s First Post`,
          content: 'This is the content of my first post. It\'s a great start to my writing journey!',
          excerpt: 'A great start to my writing journey',
          status: 'published',
          wordCount: 20,
          authorId: user.id,
          collectionIds: [userCollections[0].id],
          likes: Math.floor(Math.random() * 50),
        },
      }),
      prisma.post.create({
        data: {
          title: `${user.name}'s Draft`,
          content: 'This is a draft post that I\'m still working on. I\'ll publish it when it\'s ready.',
          excerpt: 'Work in progress',
          status: 'draft',
          wordCount: 18,
          authorId: user.id,
          collectionIds: [userCollections[1].id],
          likes: 0,
        },
      }),
      prisma.post.create({
        data: {
          title: `${user.name}'s Second Post`,
          content: 'This is the content of my second post. I\'m getting better at writing!',
          excerpt: 'Getting better at writing',
          status: 'published',
          wordCount: 15,
          authorId: user.id,
          collectionIds: [userCollections[0].id],
          likes: Math.floor(Math.random() * 50),
        },
      }),
    ]);
    
    posts.push(...userPosts);
  }

  console.log(`Created ${posts.length} posts`);

  // Create saved posts (each user saves some posts from other users)
  const savedPosts = [];
  
  for (const user of users) {
    const otherUsersPosts = posts.filter(p => p.authorId !== user.id && p.status === 'published');
    
    // Each user saves 2 posts from other users
    for (let i = 0; i < Math.min(2, otherUsersPosts.length); i++) {
      const savedPost = await prisma.savedPost.create({
        data: {
          userId: user.id,
          postId: otherUsersPosts[i].id,
        },
      });
      
      savedPosts.push(savedPost);
    }
  }

  console.log(`Created ${savedPosts.length} saved posts`);

  // Update collections to include posts
  for (const collection of collections) {
    const userFound = users.find(u => u.id === collection.userId);
    
    // Skip if user not found (shouldn't happen in this case but TypeScript needs this check)
    if (!userFound) continue;
    
    const userPosts = posts.filter(p => p.authorId === userFound.id);
    
    if (collection.name.includes('Favorites')) {
      // Add published posts to favorites
      await prisma.collection.update({
        where: { id: collection.id },
        data: {
          postIds: userPosts.filter(p => p.status === 'published').map(p => p.id),
        },
      });
    } else if (collection.name.includes('Drafts')) {
      // Add draft posts to drafts
      await prisma.collection.update({
        where: { id: collection.id },
        data: {
          postIds: userPosts.filter(p => p.status === 'draft').map(p => p.id),
        },
      });
    }
  }

  console.log('Updated collections with posts');
  console.log('Seeding finished');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });