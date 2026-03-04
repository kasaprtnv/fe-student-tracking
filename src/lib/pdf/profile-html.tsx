import { UserProfile, ProfilePdfMilestone } from '@/types/profile';

// const API_STATIC_URL =
//   process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:3001/static';

const profilePdfCss = `
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #fefefe;
  color: #111827;
  font-size: 14px;
  margin: 0;
  padding: 32px;
}

.page {
  width: 800px;
  margin: 0 auto;
}

/* ===== Header ===== */
.header {
  display: flex;
  text-align: left;
}

.header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
}

.header p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.header-logo {
  width: 100px;
  margin-bottom: 20px;
  background-color: black;
}
  
.header-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* ===== Card ===== */
.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  margin-right: 30px;
  margin-bottom: 24px;
  box-shadow: 0 5px 24px 15px rgba(0,0,0,0.06);
}

/* ===== Profile ===== */
.profile-header {
  display: flex;
  gap: 24px;
  align-items: center;
}

.avatar img {
  margin-top: 25px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.profile-info h2 {
  margin: 0;
  font-size: 20px;
}

.profile-info p {
  margin: 4px 0;
  color: #4b5563;
}

/* ===== Info Grid ===== */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 130px;
  margin-top: 8px;
}

.info-grid p {
  margin: 4px 0;
  color: #374151;
}


/* ===== Progress ===== */
.progress-wrapper {
  margin-top: 12px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

/* ===== Section ===== */
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 6px;
}

.milestone-card:not(:first-child) .section-title {
  display: none;
}

/* ===== Milestone ===== */
.milestone {
  margin-bottom: 32px;
  padding-left: 16px;
  padding-rigth: 16px;
  border-left: 4px solid #22c55e;
  break-inside: avoid;
  page-break-inside: avoid;
}
  
.milestone.page-break {
  page-break-before: always;
  break-before: page;
  padding-top: 40px;
}

.milestone:not(:last-child)::after {
  content: '';
  display: block;
  height: 1px;
  background: #e5e7eb; /* เทาอ่อน */
  margin-top: 20px;
}
  
.milestone-card {
  width: 100%;
  break-inside: avoid;
  page-break-inside: avoid;

}

.milestone-card.page-break {
  break-before: page;
}


.milestone h3 {
  margin: 0;
  font-size: 15px;
}

.milestone p {
  margin: 6px 0 12px;
  color: #6b7280;
  font-size: 13px;
}

/* ===== Steps ===== */
.step {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 6px;
}

.step.approved {
  background: #defcee;
  color: #166534;
}

.step.available {
  background: #DBDBDB;
  color: black;
}

.step.declined {
  background: #fee2e2;
  color: #991b1b;
}

/* ===== Footer ===== */
.footer {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}
`;

export function profilePdfHtml(
  profile: UserProfile & { milestones: ProfilePdfMilestone[] },
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>${profilePdfCss}</style>
</head>
<body>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <img
        src="${process.env.NEXT_PUBLIC_PICTURE_URL}NewLogoStudentBG.png"
        class="header-logo"
      />
      <div class="header-text">
        <h1>Graduate Learning Progress Report</h1>
        <p>Graduate Learning Tracking System</p>
      </div>
    </div>

    <!-- PROFILE -->
    <div class="card">
      <div class="profile-header">
        <div class="avatar">
          <img
            src="${process.env.NEXT_PUBLIC_STATIC_URL}${profile.profileImageUrl}"
            class="header-logo"
          />
        </div>
        <!-- Info -->
        <div class="profile-info">
          <h2>${profile.firstName} ${profile.lastName}</h2>

          <div class="info-grid">
            <div>
              <p><strong>Student ID :</strong> ${profile.code}</p>
              <p><strong>Email :</strong> ${profile.email}</p>
            </div>

            <div>
              <p><strong>Course :</strong> ${profile.courseName ?? '-'}</p>
              <p><strong>Major :</strong> ${profile.major ?? '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- MILESTONES -->
    <div class="card">
      ${profile.milestones
        .map(
          (m) => `
    <div class="milestone-card">
      <div class="section-title">Milestones Progress</div>

      <div class="milestone">
        <h3>${m.name}</h3>
        ${m.description ? `<p>${m.description}</p>` : ''}

        ${m.steps
          .map(
            (s) => `
            <div class="step ${s.status}">
              <span>${s.name}</span>
              <strong>${s.status}</strong>
            </div>
          `,
          )
          .join('')}
      </div>

    </div>
  `,
        )
        .join('')}

    </div>

    <!-- FOOTER -->
    <div class="footer">
      Graduate Learning Tracking System • Generated automatically
    </div>

  </div>
</body>
</html>
`;
}
