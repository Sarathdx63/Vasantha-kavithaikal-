import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'vasantham.db');
export const db = new Database(DB_PATH);
export const getDb = () => db;

// Enable WAL mode for high performance and concurrency
db.pragma('journal_mode = WAL');

// Initialize Database Schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS poems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'இயற்கை',
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      contact_email TEXT,
      likes_count INTEGER DEFAULT 0,
      reads_count INTEGER DEFAULT 0,
      downloads_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tamil_title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT NOT NULL,
      cover_url TEXT NOT NULL,
      amazon_url TEXT NOT NULL,
      publication_year INTEGER NOT NULL,
      isbn TEXT,
      pages INTEGER,
      price_inr INTEGER,
      featured INTEGER DEFAULT 1,
      status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'rejected'
      contact_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe schema migrations for existing database
  try {
    db.exec("ALTER TABLE books ADD COLUMN status TEXT DEFAULT 'approved'");
  } catch {}
  try {
    db.exec("ALTER TABLE books ADD COLUMN contact_email TEXT");
  } catch {}

  // Seed default admin if not exists
  const checkAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!checkAdmin) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'vasantham2026!';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
    console.log('✅ Default admin seeded: username="admin"');
  }

  // Seed books if empty
  const bookCount = (db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number }).count;
  if (bookCount === 0) {
    const insertBook = db.prepare(`
      INSERT INTO books (title, tamil_title, author, description, cover_url, amazon_url, publication_year, isbn, pages, price_inr, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBook.run(
      'Shadow of Dreams',
      'கனவுகளின் நிழல்',
      'கவிஞர் வசந்தன் (Vasanthan)',
      'மனித மனத்தின் ஆழ்ந்த அமைதியையும், கனவுகளின் எல்லையற்ற சிறகுகளையும் பேசும் மெல்லிசை கவிதைகளின் தொகுப்பு. 120 தேர்ந்தெடுத்த நவீன கவிதைகள் அடங்கிய பொக்கிஷம்.',
      '/src/assets/images/book_cover_kanavugal_1794242034346.jpg',
      'https://www.amazon.in/dp/B09TAMILPOETRY1',
      2025,
      '978-93-87654-21-0',
      192,
      280,
      1
    );

    insertBook.run(
      'Island of Memories',
      'நினைவுகளின் தீவு',
      'கவிஞர் எழிலரசி (Ezhilarasi)',
      'கடற்கரையோரத்து மாலை நேரத்து மௌனமும், பால்ய கால நினைவுகளும் சங்கமிக்கும் உணர்ச்சிமயமான கவிதைத் திரட்டு. தமிழ்நாடு இலக்கிய விருது பெற்ற நூல்.',
      '/src/assets/images/book_cover_ninaivugal_1794242034529.jpg',
      'https://www.amazon.in/dp/B09TAMILPOETRY2',
      2024,
      '978-93-87654-35-7',
      160,
      240,
      1
    );

    insertBook.run(
      'Fingers of Rain',
      'மழையின் விரல்கள்',
      'கவிஞர் பாரதிதாசன் வழித்தோன்றல்',
      'மழைத் துளிகள் பூமிக்கு எழுதும் ரகசியக் கடிதங்கள். பருவமழை, கிராமத்து நதி, மண்புழுவின் வாசம் என இயற்கை எழிலை சொற்களால் செதுக்கிய கவிதைகள்.',
      '/src/assets/images/book_cover_mazhai_1794242035067.jpg',
      'https://www.amazon.in/dp/B09TAMILPOETRY3',
      2026,
      '978-93-87654-88-3',
      176,
      260,
      1
    );
    console.log('✅ Default books seeded');
  }

  // Seed poems if empty
  const poemCount = (db.prepare('SELECT COUNT(*) as count FROM poems').get() as { count: number }).count;
  if (poemCount === 0) {
    const insertPoem = db.prepare(`
      INSERT INTO poems (title, author, content, category, status, contact_email, likes_count, reads_count, downloads_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Approved poems
    insertPoem.run(
      'வசந்தத்தின் முதல் அழைப்பு',
      'வசந்தகுமார்',
      `பனிக்காலத்து இலை உதிர்தலின் முடிவில்
மெல்லத் தலையசைக்கும் பசுந்தளிரே,
உன் மெல்லிய மௌனம் தான்
இந்தக் காட்டின் முதல் சங்கீதமோ?

மலர்களின் இதழ்களில் தேங்கிய பனித்துளி
சூரியனின் முதல் ஸ்பரிசத்தில்
வைரமாய் மின்னும் இந்த நொடி,
வாழ்வின் அர்த்தம் வசந்தமாய் நிறைகிறது.`,
      'இயற்கை',
      'approved',
      'vasantham@poet.com',
      42,
      215,
      18
    );

    insertPoem.run(
      'செந்தமிழ்த் தேன் சுவை',
      'சுப்பிரமணிய பாரதியார் மரபு',
      `யாமறிந்த மொழிகளிலே தமிழ்மொழி போல்
இனிதாவது எங்கும் காணோம்!
பாருக்குள்ளே நல்ல நாடு - எங்கள்
பாரத நாடென்போம் பெருமை கொள்வோம்!

வார்த்தைகளில் பிறக்கும் தேன்,
தமிழின் தொன்மையில் மலரும் வான்,
என்றும் அழியாத இலக்கிய நதியாய்
ஓடிக்கொண்டிருக்கும் தமிழ் வாழ்க!`,
      'தமிழ் பெருமை',
      'approved',
      'classic@tamil.org',
      89,
      540,
      47
    );

    insertPoem.run(
      'மௌனத்தின் மொழி',
      'அருண்மொழி வர்மன்',
      `பேசாத சொற்களுக்குள்
ஆயிரம் கவிதைகள் உறங்குகின்றன.
உன் பார்வை சொல்லும் மௌனத்தை
எந்த அகராதியும் மொழிபெயர்க்க முடிவதில்லை.

அலையற்ற நதியின் ஆழம் போல
என் அமைதிக்குள்
உன் நினைவுகள் மட்டும்
மெல்ல சலசலத்துக் கொண்டிருக்கின்றன.`,
      'காதல்',
      'approved',
      'arun@gmail.com',
      64,
      310,
      29
    );

    insertPoem.run(
      'வானத்து சிறகுகள்',
      'கவிதைச்செல்வி',
      `கூண்டில் அடைபட்ட கிளிகளுக்குத் தெரியாது
வானத்தின் அகலம் என்னவென்று...
சிறகுகளை விரிப்பதே
சுதந்திரத்தின் முதல் பிரார்த்தனை.

விழுவதைப் பற்றி யோசிக்காதே,
பறக்கும் தருணத்தை மட்டுமே நேசி!
எல்லைகள் மனிதன் வகுத்தது,
வானம் பறவைகளுக்காக மட்டுமே படைக்கப்பட்டது.`,
      'தத்துவம்',
      'approved',
      'chelvi@tamilmail.com',
      38,
      180,
      12
    );

    insertPoem.run(
      'காற்றோடு ஒரு உரையாடல்',
      'கலைவாணன்',
      `எங்கிருந்து வருகிறாய் காற்றே?
மலையிடுக்குகளில் தழுவி வந்த
குளிர்ந்த ஈரப்பதத்தோடு,
என் ஜன்னல் கம்பிகளைத் தொட்டு
என்ன ரகசியம் சொல்கிறாய்?

வாழ்வு என்பது
நீ வீசுவது போலத்தான்...
கண்களுக்குத் தெரிவதில்லை,
ஆனால் இதயத்தில் உணர முடிகிறது.`,
      'இயற்கை',
      'approved',
      'kalai@poet.net',
      27,
      145,
      9
    );

    // Seed Pending poems for Admin Moderation
    insertPoem.run(
      'மழைத் துளிகளின் நடனம்',
      'இளவேனில் கதிர்',
      `மேகங்கள் கருக்குகையில்
வானம் பூமிக்கு அனுப்பும் காதல் மடல்கள்
மழைத்துளிகளாய் பொழிகின்றன.
மண்வாசனை உயிர்த்தெழும் போதெல்லாம்
மனிதன் மீண்டும் குழந்தையாகிறான்.`,
      'இயற்கை',
      'pending',
      'ilavenil@sample.com',
      0,
      0,
      0
    );

    insertPoem.run(
      'இரவின் தனிமை தீபம்',
      'சுமதி ராமன்',
      `இரவு ஒரு கருப்பு போர்வை அல்ல,
அது நினைவுகளின் விண்மீன் வெளிச்சம்.
தனிமையின் சுடரில் எரியும் திரி
எப்போதும் கவிதையாகவே பிரகாசிக்கிறது.`,
      'வாழ்க்கை',
      'pending',
      'sumathi@reader.com',
      0,
      0,
      0
    );

    console.log('✅ Default poems seeded (both approved and pending moderation)');
  }
}
