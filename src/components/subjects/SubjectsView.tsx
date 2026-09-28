import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Archive, 
  Edit3, 
  Calendar, 
  FolderCheck, 
  FolderArchive,
  Check,
  Palette
} from 'lucide-react';
import { Header } from '../layout/Header';
import { useStudyOS } from '../../lib/storage';
import { confidenceConfig, getTodayDateString, PRESET_SUBJECT_COLORS } from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import type { Subject, Semester, Topic, ConfidenceLevel } from '../../types';


export const SubjectsView: React.FC = () => {
  const { 
    data, 
    activeSemester, 
    setActiveSemesterId, 
    addSubject, 
    updateSubject, 
    addSemester, 
    updateSemester,
    addTopic,
    updateTopic 
  } = useStudyOS();

  // Semester view selection
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(activeSemester?.id || 'sem-current');
  const [showArchivedSubjects, setShowArchivedSubjects] = useState(false);

  // Modals state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [semesterModalOpen, setSemesterModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [targetSubjectForTopic, setTargetSubjectForTopic] = useState<string | null>(null);

  // Subject form
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subColor, setSubColor] = useState('#525252');
  const [subDescription, setSubDescription] = useState('');

  // Semester form
  const [semName, setSemName] = useState('');
  const [semYear, setSemYear] = useState('2025-2026');
  const [semStart, setSemStart] = useState('');
  const [semEnd, setSemEnd] = useState('');

  // Topic form
  const [topicTitle, setTopicTitle] = useState('');
  const [topicConfidence, setTopicConfidence] = useState<ConfidenceLevel>('learning');
  const [topicHandbookUrl, setTopicHandbookUrl] = useState('');

  const currentViewingSemester = data.semesters.find((s) => s.id === selectedSemesterId) || activeSemester;

  const currentSubjects = data.subjects.filter((s) => {
    if (s.semesterId !== currentViewingSemester?.id) return false;
    if (!showArchivedSubjects && s.isArchived) return false;
    return true;
  });

  // Open Subject Modal
  const handleOpenSubjectModal = (sub?: Subject) => {
    if (sub) {
      setEditingSubject(sub);
      setSubName(sub.name);
      setSubCode(sub.code);
      setSubColor(sub.color || '#3B82F6');
      setSubDescription(sub.description || '');
    } else {
      setEditingSubject(null);
      setSubName('');
      setSubCode('');
      // Automatically suggest the next unused preset color
      const usedColors = new Set(data.subjects.map((s) => s.color.toLowerCase()));
      const availablePreset = PRESET_SUBJECT_COLORS.find((c) => !usedColors.has(c.hex.toLowerCase()));
      setSubColor(availablePreset ? availablePreset.hex : PRESET_SUBJECT_COLORS[0].hex);
      setSubDescription('');
    }
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim() || !currentViewingSemester) return;

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        name: subName.trim(),
        code: subCode.trim(),
        color: subColor,
        description: subDescription.trim() || undefined,
      });
    } else {
      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        semesterId: currentViewingSemester.id,
        name: subName.trim(),
        code: subCode.trim(),
        color: subColor,
        description: subDescription.trim() || undefined,
        isArchived: false,
      };
      addSubject(newSubject);
    }
    setSubjectModalOpen(false);
  };

  const handleToggleArchiveSubject = (sub: Subject) => {
    updateSubject({
      ...sub,
      isArchived: !sub.isArchived,
    });
  };

  // Open Semester Modal
  const handleOpenSemesterModal = (sem?: Semester) => {
    if (sem) {
      setEditingSemester(sem);
      setSemName(sem.name);
      setSemYear(sem.academicYear);
      setSemStart(sem.startDate);
      setSemEnd(sem.endDate);
    } else {
      setEditingSemester(null);
      setSemName('');
      setSemYear('2026-2027');
      setSemStart('');
      setSemEnd('');
    }
    setSemesterModalOpen(true);
  };

  const handleSaveSemester = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!semName.trim()) return;

    if (editingSemester) {
      updateSemester({
        ...editingSemester,
        name: semName.trim(),
        academicYear: semYear.trim(),
        startDate: semStart,
        endDate: semEnd,
      });
    } else {
      const newSemester: Semester = {
        id: `sem-${Date.now()}`,
        name: semName.trim(),
        academicYear: semYear.trim(),
        startDate: semStart,
        endDate: semEnd,
        isActive: false,
        isArchived: false,
      };
      addSemester(newSemester);
      setSelectedSemesterId(newSemester.id);
    }
    setSemesterModalOpen(false);
  };

  // Topic Modal
  const handleOpenAddTopic = (subjectId: string) => {
    setTargetSubjectForTopic(subjectId);
    setTopicTitle('');
    setTopicConfidence('learning');
    setTopicHandbookUrl('');
    setTopicModalOpen(true);
  };

  const handleSaveTopic = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !targetSubjectForTopic) return;

    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      subjectId: targetSubjectForTopic,
      title: topicTitle.trim(),
      confidence: topicConfidence,
      handbookUrl: topicHandbookUrl.trim() || undefined,
      nextReviewDate: getTodayDateString(),
    };

    addTopic(newTopic);
    setTopicModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <Header
        title="Academic Structure"
        subtitle="Dynamic semester frameworks, syllabus courses, and topic hierarchies"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenSemesterModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#1E1E1E] hover:bg-[#262626] text-[#F0F0F0] border border-[#2E2E2E] text-xs font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8C8C8C]" />
              <span>New Semester</span>
            </button>
            <button
              onClick={() => handleOpenSubjectModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold tracking-wide transition-all shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Subject</span>
            </button>
          </div>
        }
      />

      {/* Semester Selector Bar */}
      <div className="bg-[#181818] p-4 rounded-xl border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono text-[#8C8C8C]">Viewing Semester:</span>
          {data.semesters.map((sem) => {
            const isViewing = sem.id === currentViewingSemester?.id;
            const isAppActive = sem.isActive;

            return (
              <button
                key={sem.id}
                onClick={() => setSelectedSemesterId(sem.id)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isViewing
                    ? 'bg-[#242424] text-white border border-[#383838]'
                    : 'bg-[#141414] text-[#8C8C8C] border border-[#242424] hover:text-white'
                }`}
              >
                <span>{sem.name}</span>
                {isAppActive && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#17221A] text-[#7EBA8C] border border-[#233827]">
                    Active
                  </span>
                )}
                {sem.isArchived && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#1F1F1F] text-[#707070]">
                    Archived
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Semester Actions */}
        {currentViewingSemester && (
          <div className="flex items-center gap-2 text-xs">
            {!currentViewingSemester.isActive && !currentViewingSemester.isArchived && (
              <button
                onClick={() => setActiveSemesterId(currentViewingSemester.id)}
                className="px-3 py-1.5 rounded bg-[#17221A] text-[#7EBA8C] border border-[#233827] hover:bg-[#1E2E22] transition-colors flex items-center gap-1.5 font-mono text-xs"
              >
                <FolderCheck className="w-3.5 h-3.5" />
                <span>Set as Active Semester</span>
              </button>
            )}

            <button
              onClick={() => handleOpenSemesterModal(currentViewingSemester)}
              className="p-2 text-[#707070] hover:text-white rounded hover:bg-[#222222]"
              title="Edit semester"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                updateSemester({
                  ...currentViewingSemester,
                  isArchived: !currentViewingSemester.isArchived,
                  isActive: currentViewingSemester.isArchived ? currentViewingSemester.isActive : false,
                });
              }}
              className="p-2 text-[#707070] hover:text-[#D19A66] rounded hover:bg-[#222222]"
              title={currentViewingSemester.isArchived ? 'Unarchive semester' : 'Archive semester'}
            >
              <FolderArchive className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Active Semester Banner */}
      <div className="p-4 rounded-xl bg-[#181818] border border-[#242424] flex items-center justify-between text-sm text-[#A3A3A3]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#7EBA8C]"></span>
          <span>
            Active Semester: <strong className="text-[#F5F5F5] font-medium">{activeSemester?.name}</strong>
          </span>
          <span className="text-[#484848]">|</span>
          <span className="text-xs font-mono text-[#8C8C8C]">{activeSemester?.academicYear}</span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8C8C8C] hover:text-white">
          <input
            type="checkbox"
            checked={showArchivedSubjects}
            onChange={(e) => setShowArchivedSubjects(e.target.checked)}
            className="rounded bg-[#141414] border-[#333333] text-white focus:ring-0"
          />
          <span>Show Archived Subjects</span>
        </label>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentSubjects.length === 0 ? (
          <div className="col-span-2 py-16 bg-[#181818] rounded-xl border border-[#262626] p-8 text-center text-[#707070]">
            <BookOpen className="w-10 h-10 text-[#404040] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#A3A3A3]">No courses configured in this semester</p>
            <button
              onClick={() => handleOpenSubjectModal()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded bg-[#EAEAEA] text-[#121212] text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subject
            </button>
          </div>
        ) : (
          currentSubjects.map((subject) => {
            const subjectTopics = data.topics.filter((t) => t.subjectId === subject.id);
            const activeTasksCount = data.tasks.filter(
              (t) => t.subjectId === subject.id && t.status !== 'completed'
            ).length;

            return (
              <div
                key={subject.id}
                className={`bg-[#181818] rounded-xl border transition-all overflow-hidden flex flex-col ${
                  subject.isArchived
                    ? 'border-[#222222] opacity-60 bg-[#141414]'
                    : 'border-[#262626] hover:border-[#363636]'
                }`}
              >
                {/* Subject Header */}
                <div className="p-5 border-b border-[#242424] bg-[#1A1A1A] flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{
                        backgroundColor: subject.color || '#3B82F6',
                        boxShadow: `0 0 8px ${(subject.color || '#3B82F6')}60`,
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <SubjectBadge subject={subject} />
                        {subject.isArchived && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1F1F1F] text-[#707070]">
                            Archived
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-[17px] font-semibold text-[#F5F5F5] mt-1">
                        {subject.name}
                      </h3>
                      {subject.description && (
                        <p className="text-sm text-[#A3A3A3] mt-1.5 leading-relaxed">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenSubjectModal(subject)}
                      className="p-1.5 rounded text-[#707070] hover:text-white hover:bg-[#222222]"
                      title="Edit subject"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchiveSubject(subject)}
                      className="p-1.5 rounded text-[#707070] hover:text-[#D19A66] hover:bg-[#222222]"
                      title={subject.isArchived ? 'Restore subject' : 'Archive subject'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Topics List & Management */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#242424]">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#8C8C8C]">
                        Syllabus Topics ({subjectTopics.length}) • Active Tasks ({activeTasksCount})
                      </span>
                      <button
                        onClick={() => handleOpenAddTopic(subject.id)}
                        className="text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Topic</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {subjectTopics.length === 0 ? (
                        <p className="text-sm text-[#707070] italic py-2">
                          No topics added yet.
                        </p>
                      ) : (
                        subjectTopics.map((topic) => {
                          const conf = confidenceConfig[topic.confidence];
                          return (
                            <div
                              key={topic.id}
                              className="p-3 rounded-lg bg-[#1E1E1E] border border-[#262626] hover:border-[#333333] transition-all flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-[#F0F0F0] truncate">
                                  {topic.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${conf.badgeClass}`}>
                                    {conf.label}
                                  </span>

                                  {topic.handbookUrl && (
                                    <a
                                      href={topic.handbookUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A3A3A3] hover:text-white"
                                      title="Open notes in academic handbook"
                                    >
                                      <span>Handbook Notes ↗</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                              <select
                                value={topic.confidence}
                                onChange={(e) =>
                                  updateTopic({
                                    ...topic,
                                    confidence: e.target.value as ConfidenceLevel,
                                  })
                                }
                                className="bg-[#141414] text-xs font-mono rounded-md px-2 py-1 border border-[#2A2A2A] text-[#A3A3A3] focus:outline-none"
                              >
                                <option value="not_studied">Not studied</option>
                                <option value="learning">Learning</option>
                                <option value="needs_practice">Needs practice</option>
                                <option value="confident">Confident</option>
                              </select>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subject Modal */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#181818] border border-[#2E2E2E] rounded-xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-[#F5F5F5] mb-4">
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h3>
            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robot Dynamics & Control"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-sm focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ROB-605"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none focus:border-[#4A4A4A] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Color Accent</label>
                <div className="space-y-3 bg-[#141414] p-3.5 rounded-lg border border-[#262626]">
                  {/* Swatches */}
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_SUBJECT_COLORS.map((c) => {
                      const isSelected = subColor.toLowerCase() === c.hex.toLowerCase();
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setSubColor(c.hex)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#141414] scale-110'
                              : 'opacity-75 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                        </button>
                      );
                    })}

                    {/* Custom Color Input */}
                    <div className="relative flex items-center">
                      <label
                        className="w-6 h-6 rounded-full border border-[#3A3A3A] flex items-center justify-center cursor-pointer hover:border-[#606060] transition-colors overflow-hidden"
                        title="Custom hex color"
                        style={{
                          backgroundColor: !PRESET_SUBJECT_COLORS.some((c) => c.hex.toLowerCase() === subColor.toLowerCase())
                            ? subColor
                            : 'transparent',
                        }}
                      >
                        <input
                          type="color"
                          value={subColor}
                          onChange={(e) => setSubColor(e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        {PRESET_SUBJECT_COLORS.some((c) => c.hex.toLowerCase() === subColor.toLowerCase()) && (
                          <Palette className="w-3 h-3 text-[#707070]" />
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#222222] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#707070] font-mono text-[11px]">Preview:</span>
                      <SubjectBadge
                        subject={{
                          id: 'preview',
                          name: subName || 'Course Name',
                          code: subCode || 'CODE',
                          color: subColor,
                          semesterId: '',
                          isArchived: false,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[#8C8C8C] text-[11px] uppercase">{subColor}</span>
                  </div>
                </div>
              </div>


              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Overview of syllabus, derivation focus, or lab structure..."
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#242424]">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white hover:bg-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semester Modal */}
      {semesterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#181818] border border-[#2E2E2E] rounded-xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-[#F5F5F5] mb-4">
              {editingSemester ? 'Edit Semester' : 'Create New Semester'}
            </h3>
            <form onSubmit={handleSaveSemester} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Semester Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semester 4 (Thesis & Research)"
                  value={semName}
                  onChange={(e) => setSemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-sm focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Academic Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-2027"
                  value={semYear}
                  onChange={(e) => setSemYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={semStart}
                    onChange={(e) => setSemStart(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={semEnd}
                    onChange={(e) => setSemEnd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#242424]">
                <button
                  type="button"
                  onClick={() => setSemesterModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white hover:bg-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold"
                >
                  Save Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {topicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#181818] border border-[#2E2E2E] rounded-xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-[#F5F5F5] mb-4">
              Add Topic to Syllabus
            </h3>
            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extended Kalman Filter (EKF) SLAM"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-sm focus:outline-none focus:border-[#4A4A4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Initial Confidence</label>
                <select
                  value={topicConfidence}
                  onChange={(e) => setTopicConfidence(e.target.value as ConfidenceLevel)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#141414] border border-[#282828] text-[#F0F0F0] text-xs focus:outline-none"
                >
                  <option value="not_studied">Not studied</option>
                  <option value="learning">Learning</option>
                  <option value="needs_practice">Needs practice</option>
                  <option value="confident">Confident</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">
                  Academic Handbook URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://handbook.internal/robotics/ekf-slam"
                  value={topicHandbookUrl}
                  onChange={(e) => setTopicHandbookUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[#F5F5F5] text-xs focus:outline-none focus:border-[#4A4A4A] font-mono"
                />
                <p className="text-xs text-[#707070] mt-1.5">
                  Optional link to corresponding derivations in your separate handbook notes.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#242424]">
                <button
                  type="button"
                  onClick={() => setTopicModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-medium text-[#8C8C8C] hover:text-white hover:bg-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-semibold"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
