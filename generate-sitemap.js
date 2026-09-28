const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function generateSitemap() {
  try {
    // جربنا جمع البيانات مع طباعة عدد المنتجات للتأكد
    const snapshot = await db.collection('products').get();
    console.log(`Found ${snapshot.size} products in Firestore.`);
    
    let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlOutput += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    xmlOutput += `  <url>\n`;
    xmlOutput += `       <loc>https://rander1997.github.io/Rander/</loc>\n`;
    xmlOutput += `       <priority>1.0000</priority>\n`;
    xmlOutput += `  </url>\n`;

    snapshot.forEach((doc) => {
      let data = doc.data();
      let slug = data.slug || doc.id;
      xmlOutput += `  <url>\n`;
      xmlOutput += `       <loc>https://rander1997.github.io/Rander/?product=${slug}</loc>\n`;
      xmlOutput += `       <priority>0.8000</priority>\n`;
      xmlOutput += `  </url>\n`;
    });

    xmlOutput += `</urlset>`;

    fs.writeFileSync('sitemap.xml', xmlOutput);
    console.log('Sitemap generated successfully.');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
