import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import ReportsList from './ReportsList';
import NewReport from './NewReport';
import CrashAvatars from './Avatars/CrashAvatars';
import Availability from './Schedule/Availability';
import Booking from './Schedule/Booking';
import UserGraph from './Graph/UserGraph';
import Inbox from './Inbox/Inbox';
import LogsPage from './Logs/LogsPage';

export default function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route index element={<ReportsList />} />
        <Route path="new-report" element={<NewReport />} />
        <Route path="avatars/crash" element={<CrashAvatars />} />
        <Route path="schedule/availability" element={<Availability />} />
        <Route path="schedule/booking" element={<Booking />} />
        <Route path="graph" element={<UserGraph />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="logs" element={<LogsPage />} />
      </Routes>
    </Layout>
  );
}