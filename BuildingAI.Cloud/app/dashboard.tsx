import React from "react";
import Sidebar from "../../Reference_folder/components/sidebar";
import DashboardPreview from "../../Reference_folder/components/dashboard-preview";
import NumbersThatSpeak from "../../Reference_folder/components/numbers-that-speak";
import DocumentationSection from "../../Reference_folder/components/documentation-section";
import FooterSection from "../../Reference_folder/components/footer-section";

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <DashboardPreview />
        <NumbersThatSpeak />
        <DocumentationSection />
      </main>
      <FooterSection />
    </div>
  );
}
