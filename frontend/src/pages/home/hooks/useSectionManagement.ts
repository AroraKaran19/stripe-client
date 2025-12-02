import { useState } from "react";
import type { SectionType } from "../components/AddSectionModal";

export const useSectionManagement = (
  initialSections: SectionType[] = [
    "payments",
    "grossVolume",
    "netVolume",
    "failedPayments",
    "newCustomers",
    "topCustomers",
  ]
) => {
  const [sections, setSections] = useState<SectionType[]>(initialSections);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedSection, setDraggedSection] = useState<SectionType | null>(
    null
  );
  const [dragOverSection, setDragOverSection] = useState<SectionType | null>(
    null
  );

  const handleAddSection = (sectionId: SectionType) => {
    if (!sections.includes(sectionId)) {
      setSections([...sections, sectionId]);
    }
  };

  const handleRemoveSection = (sectionId: SectionType) => {
    setSections(sections.filter((id) => id !== sectionId));
  };

  const handleDragStart = (sectionId: SectionType) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSection && draggedSection !== targetSectionId) {
      e.dataTransfer.dropEffect = "move";
      setDragOverSection(targetSectionId);
    }
  };

  const handleDragEnter = (
    e: React.DragEvent,
    targetSectionId: SectionType
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSection && draggedSection !== targetSectionId) {
      setDragOverSection(targetSectionId);
    }
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: SectionType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const draggedIndex = sections.indexOf(draggedSection);
    const targetIndex = sections.indexOf(targetSectionId);
    const newSections = [...sections];
    newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);
    setSections(newSections);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  return {
    sections,
    setSections,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditMode,
    setIsEditMode,
    draggedSection,
    dragOverSection,
    handleAddSection,
    handleRemoveSection,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
};
