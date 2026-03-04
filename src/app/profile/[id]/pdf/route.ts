import { fetchProfileData } from '@/lib/server/fetch-profile-data';
import { fetchMilestonesWithStatus } from '@/lib/server/fetch-milestones-with-status';
import { profilePdfHtml } from '@/lib/pdf/profile-html';
import { generatePdf } from '@/lib/pdf/generate-pdf';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await context.params;

    // profile
    const profile = await fetchProfileData(userId);

    // milestones
    if (!profile.courseId) {
      throw new Error('User has no course');
    }

    const milestones = await fetchMilestonesWithStatus(
      profile.courseId,
      profile.id,
    );
    //รวมข้อมูล
    const fullProfile = {
      ...profile,
      milestones,
    };

    console.log(profile);

    //render PDF
    const html = profilePdfHtml(fullProfile);
    const pdfUint8 = await generatePdf(html);

    return new Response(Buffer.from(pdfUint8), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="profile.pdf"',
      },
    });
  } catch (err) {
    console.error('[PROFILE PDF ERROR]', err);
    return new Response('Failed to generate PDF', { status: 500 });
  }
}
