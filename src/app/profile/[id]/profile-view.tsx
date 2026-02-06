// // components/profile/ProfileView.tsx
// import { UserProfileWithMilestones } from '@/types/profile';

// interface Props {
//   profile: UserProfileWithMilestones;
// }

// export function ProfileView({ profile }: Props) {
//   return (
//     <div className="profile-page">
//       <h2>รายละเอียดข้อมูลส่วนตัว</h2>

//       <div className="profile-header">
//         <div className="avatar" />
//         <div className="info">
//           <p>
//             <b>ชื่อ-นามสกุล:</b> {profile.firstName} {profile.lastName}
//           </p>
//           <p>
//             <b>รหัสนักศึกษา:</b> {profile.code}
//           </p>
//           <p>
//             <b>หลักสูตร:</b> {profile.courseName ?? '-'}
//           </p>
//           <p>
//             <b>อีเมล:</b> {profile.email}
//           </p>
//           <p>
//             <b>เบอร์โทร:</b> {profile.phone ?? '-'}
//           </p>
//         </div>
//       </div>

//       <h3>ความคืบหน้า</h3>
//       <div className="progress-bar">
//         <div className="progress" style={{ width: `${profile.progress}%` }} />
//       </div>

//       {profile.milestones.map((m) => (
//         <div key={m.id} className="milestone">
//           <h4>{m.title}</h4>

//           {m.steps.map((s) => (
//             <div key={s.id} className={`step ${s.status}`}>
//               {s.title} – {s.status}
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// }
