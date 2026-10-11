import { useUI } from "../../context/UIContext";
import { DocumentsPanel } from "../../features/documents/DocumentsPanel";
import { PageHeader } from "./ui";

export const Documents = () => {
  const { showToast } = useUI();
  return (
    <>
      <PageHeader title="Documents" subtitle="Proposals, contracts, technical documents and receipts — as Methynix or Kaspa." />
      <DocumentsPanel showToast={showToast} />
    </>
  );
};
