import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: `zdmsFacture <${FROM_EMAIL}>`,
    to,
    subject: "Réinitialisation de votre mot de passe zdmsFacture",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7C3AED;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe zdmsFacture.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block; background:#7C3AED; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="color:#666; font-size:13px;">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
      </div>
    `,
  });
}
