const admin = require('firebase-admin');
const fs = require('fs');

// الاتصال بـ Firebase باستخدام مفتاح الأمان المخفي في GitHub Secrets
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function generateSitemap() {
  try {
    const snapshot = await db.collection('products').get();
    
    let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlOutput += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // إضافة الصفحة الرئيسية
    xmlOutput += `  <url>\n`;
    xmlOutput += `       <loc>https://rander1997.github.io/Rander/</loc>\n`;
    xmlOutput += `       <priority>1.0000</priority>\n`;
    xmlOutput += `  </url>\n`;

    // إضافة روابط المنتجات من قاعدة البيانات
    snapshot.forEach((doc) => {
      let data = doc.data();
      let slug = data.slug || doc.id;
      xmlOutput += `  <url>\n`;
      xmlOutput += `       <loc>https://rander1997.github.io/Rander/?product=${slug}</loc>\n`;
      xmlOutput += `       <priority>0.8000</priority>\n`;
      xmlOutput += `  </url>\n`;
    });

    xmlOutput += `</urlset>`;

    // كتابة الملف وحفظه محلياً ليقوم الروبوت برفعه تلقائياً
    fs.writeFileSync('sitemap.xml', xmlOutput);
    console.log('Sitemap generated successfully with ' + snapshot.size + ' products.');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
