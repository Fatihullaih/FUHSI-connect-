import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_SERVER_DB } from './src/data/serverDefaults';
import {
  mergeUsers,
  mergePosts,
  mergeComments,
  mergeMarketplaceItems,
  mergeVerificationRequests,
  mergeReports,
  mergeVerifCandidates,
} from './src/utils/apiSync';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Central Server Database Persistence File
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
let activeDb: typeof DEFAULT_SERVER_DB = { ...DEFAULT_SERVER_DB };

function initAndLoadServerDb() {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_SERVER_DB, null, 2), 'utf-8');
      activeDb = { ...DEFAULT_SERVER_DB };
      console.log('[DB Init] Created initial data/db.json on server disk.');
    } else {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      activeDb = {
        ...DEFAULT_SERVER_DB,
        ...parsed,
        users: mergeUsers(DEFAULT_SERVER_DB.users, parsed.users || []),
        posts: mergePosts(DEFAULT_SERVER_DB.posts, parsed.posts || []),
        comments: mergeComments(DEFAULT_SERVER_DB.comments, parsed.comments || []),
        marketplaceItems: mergeMarketplaceItems(DEFAULT_SERVER_DB.marketplaceItems, parsed.marketplaceItems || []),
        pendingMarketplaceItems: mergeMarketplaceItems(DEFAULT_SERVER_DB.pendingMarketplaceItems, parsed.pendingMarketplaceItems || []),
        verificationRequests: mergeVerificationRequests(DEFAULT_SERVER_DB.verificationRequests, parsed.verificationRequests || []),
        reports: mergeReports(DEFAULT_SERVER_DB.reports, parsed.reports || []),
        verifCandidates: mergeVerifCandidates(DEFAULT_SERVER_DB.verifCandidates, parsed.verifCandidates || []),
      };
      console.log('[DB Init] Loaded central database from data/db.json on server disk with smart merge.');
    }
  } catch (err) {
    console.error('[DB Error] Failed to initialize server DB file:', err);
    activeDb = { ...DEFAULT_SERVER_DB };
  }
}

function persistServerDb() {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(activeDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Error] Failed to persist DB to file:', err);
  }
}

// Load DB on startup
initAndLoadServerDb();

// Central DB API Endpoints
app.get('/api/db', (req, res) => {
  return res.json({ success: true, db: activeDb });
});

app.post('/api/db/sync', (req, res) => {
  try {
    const updates = req.body;
    if (updates && typeof updates === 'object') {
      let changed = false;

      if (Array.isArray(updates.users)) {
        activeDb.users = mergeUsers(activeDb.users, updates.users);
        changed = true;
      }
      if (Array.isArray(updates.posts)) {
        activeDb.posts = mergePosts(activeDb.posts, updates.posts);
        changed = true;
      }
      if (Array.isArray(updates.comments)) {
        activeDb.comments = mergeComments(activeDb.comments, updates.comments);
        changed = true;
      }
      if (Array.isArray(updates.marketplaceItems)) {
        activeDb.marketplaceItems = mergeMarketplaceItems(activeDb.marketplaceItems, updates.marketplaceItems);
        changed = true;
      }
      if (Array.isArray(updates.pendingMarketplaceItems)) {
        activeDb.pendingMarketplaceItems = mergeMarketplaceItems(activeDb.pendingMarketplaceItems, updates.pendingMarketplaceItems);
        changed = true;
      }
      if (Array.isArray(updates.verificationRequests)) {
        activeDb.verificationRequests = mergeVerificationRequests(activeDb.verificationRequests, updates.verificationRequests);
        changed = true;
      }
      if (Array.isArray(updates.reports)) {
        activeDb.reports = mergeReports(activeDb.reports, updates.reports);
        changed = true;
      }
      if (Array.isArray(updates.verifCandidates)) {
        activeDb.verifCandidates = mergeVerifCandidates(activeDb.verifCandidates, updates.verifCandidates);
        changed = true;
      }
      if (typeof updates.verificationFee === 'number') {
        activeDb.verificationFee = updates.verificationFee;
        changed = true;
      }
      if (updates.notifications && typeof updates.notifications === 'object') {
        activeDb.notifications = { ...(activeDb.notifications || {}), ...updates.notifications };
        changed = true;
      }

      if (changed) {
        persistServerDb();
      }
    }
    return res.json({ success: true, db: activeDb });
  } catch (err: any) {
    console.error('[DB Sync Error]:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Sync failed' });
  }
});

// Configure Transporter with official FUHSI Connect support email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER || 'fuhsiconnectsupport@gmail.com',
    pass: process.env.SMTP_PASS || 'FUHSI-Connect1',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// API endpoint to send automatic OTP verification email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { to, otp, purpose, recipientName } = req.body;

    if (!to || !otp) {
      return res.status(400).json({ success: false, error: 'Recipient email and OTP code are required.' });
    }

    const mailOptions = {
      from: '"FUHSI Connect" <fuhsiconnectsupport@gmail.com>',
      to: to.trim(),
      subject: `[FUHSI Connect] Your ${purpose || 'Verification'} OTP Code: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #0f766e, #042f2e); padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">FUHSI Connect</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; color: #99f6e4;">Federal University of Health Sciences, Ila-Orangun</p>
          </div>
          
          <div style="padding: 28px 24px; color: #1e293b;">
            <p style="font-size: 15px; margin-top: 0; font-weight: 600;">Hello ${recipientName || 'FUHSI Student'},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Connect and share updates with other students within the campus. Your One-Time Password (OTP) for <strong>${purpose || 'Account Verification'}</strong> is:
            </p>
            
            <div style="text-align: center; margin: 28px 0;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f766e; background-color: #f0fdf4; padding: 14px 32px; border-radius: 12px; border: 2px solid #99f6e4; display: inline-block;">
                ${otp}
              </span>
            </div>
            
            <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 0;">
              Please enter this 6-digit verification code in the app to proceed. For your security, do not share this code with anyone.
            </p>
          </div>
          
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 4px 0;">Official Support: <a href="mailto:fuhsiconnectsupport@gmail.com" style="color: #0f766e; font-weight: bold; text-decoration: none;">fuhsiconnectsupport@gmail.com</a></p>
            <p style="margin: 0;">© FUHSI Connect • Student Social Network</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Success] OTP email sent to ${to}: ${info.messageId}`);
    return res.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('[SMTP Error] Failed to send email via Gmail transporter:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'SMTP Email dispatch failed',
      details: 'Ensure Gmail account allows app password authentication if required by Google.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FUHSI Connect Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
