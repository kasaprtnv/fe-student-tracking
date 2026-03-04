// type ProfilePdfData = {
//   firstName: string;
//   lastName: string;
//   course?: {
//     name: string;
//   };
//   milestones?: {
//     title: string;
//     status: string;
//   }[];
// };

// export function profilePdfTemplate(data: ProfilePdfData) {
//   return `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="utf-8" />
// <style>
//   body {
//     font-family: Arial, sans-serif;
//     font-size: 14px;
//     color: #000;
//   }
//   h1 { font-size: 22px; }
//   h2 { margin-top: 20px; }
//   .milestone { margin-bottom: 8px; }
// </style>
// </head>
// <body>

// <h1>Graduate Learning Progress Report</h1>

// <p>
//   <strong>Name:</strong>
//   ${data.firstName ?? ''} ${data.lastName ?? ''}
// </p>

// <p>
//   <strong>Course:</strong>
//   ${data.course?.name ?? '-'}
// </p>

// <h2>Milestones</h2>
// ${
//   data.milestones?.length
//     ? data.milestones
//         .map((m) => `<div class="milestone">${m.title} - ${m.status}</div>`)
//         .join('')
//     : '<p>No milestones</p>'
// }

// </body>
// </html>
// `;
// }
