import type { StudyOSData } from '../types';

export const initialMockData: StudyOSData = {
  dailyStudyGoalMinutes: 240, // 4 hours

  semesters: [
    {
      id: 'sem-current',
      name: 'Semester 3 (M2 Robotics)',
      academicYear: '2025-2026',
      startDate: '2025-09-15',
      endDate: '2026-02-28',
      isActive: true,
      isArchived: false,
    },
    {
      id: 'sem-previous',
      name: 'Semester 2 (M1 Robotics)',
      academicYear: '2024-2025',
      startDate: '2025-02-01',
      endDate: '2025-06-30',
      isActive: false,
      isArchived: true,
    }
  ],

  subjects: [
    {
      id: 'sub-rob',
      semesterId: 'sem-current',
      name: 'Robotics',
      code: 'ROB-601',
      color: '#3b82f6', // blue
      description: 'Manipulator kinematics, trajectory generation, and ROS2 control architecture',
      isArchived: false,
    },
    {
      id: 'sub-math',
      semesterId: 'sem-current',
      name: 'Mathematics',
      code: 'MTH-502',
      color: '#8b5cf6', // purple
      description: 'Convex optimization, Lie groups for robotics, and stochastic calculus',
      isArchived: false,
    },
    {
      id: 'sub-ai',
      semesterId: 'sem-current',
      name: 'Artificial Intelligence',
      code: 'CSE-603',
      color: '#06b6d4', // cyan
      description: 'Search algorithms, probabilistic graphical models, and automated planning',
      isArchived: false,
    },
    {
      id: 'sub-ml',
      semesterId: 'sem-current',
      name: 'Machine Learning',
      code: 'ML-610',
      color: '#10b981', // emerald
      description: 'Deep neural networks, reinforcement learning, and computer vision representations',
      isArchived: false,
    },
    {
      id: 'sub-past-embedded',
      semesterId: 'sem-previous',
      name: 'Embedded Systems & RTOS',
      code: 'EMB-402',
      color: '#64748b', // slate
      description: 'Microcontrollers, timers, interrupts, and FreeRTOS tasks',
      isArchived: true,
    }
  ],

  topics: [
    // Robotics topics
    {
      id: 'top-rob-1',
      subjectId: 'sub-rob',
      title: 'DH Parameters & Forward Kinematics',
      confidence: 'confident',
      lastReviewedDate: '2026-09-20',
      nextReviewDate: '2026-10-04',
      handbookUrl: 'https://notes.robotics/handbook/kinematics/dh-parameters',
      notesCount: 4,
    },
    {
      id: 'top-rob-2',
      subjectId: 'sub-rob',
      title: 'Inverse Kinematics & Numerical Solvers (DLS/Jacobian)',
      confidence: 'needs_practice',
      lastReviewedDate: '2026-09-24',
      nextReviewDate: '2026-09-27', // Due today
      handbookUrl: 'https://notes.robotics/handbook/kinematics/numerical-ik',
      notesCount: 6,
    },
    {
      id: 'top-rob-3',
      subjectId: 'sub-rob',
      title: 'Euler-Lagrange Dynamic Formulations',
      confidence: 'learning',
      lastReviewedDate: '2026-09-25',
      nextReviewDate: '2026-09-27', // Due today
      notesCount: 2,
    },

    // Mathematics topics
    {
      id: 'top-math-1',
      subjectId: 'sub-math',
      title: 'KKT Conditions & Dual Problem Formulation',
      confidence: 'needs_practice',
      lastReviewedDate: '2026-09-22',
      nextReviewDate: '2026-09-27', // Due today
      handbookUrl: 'https://notes.robotics/handbook/math/kkt-optimality',
      notesCount: 5,
    },
    {
      id: 'top-math-2',
      subjectId: 'sub-math',
      title: 'Special Euclidean Group SE(3) and Lie Algebras',
      confidence: 'learning',
      lastReviewedDate: '2026-09-18',
      nextReviewDate: '2026-09-28',
      handbookUrl: 'https://notes.robotics/handbook/math/lie-groups-se3',
      notesCount: 3,
    },

    // AI topics
    {
      id: 'top-ai-1',
      subjectId: 'sub-ai',
      title: 'A* and Any-Angle Path Planning (Theta*)',
      confidence: 'confident',
      lastReviewedDate: '2026-09-15',
      nextReviewDate: '2026-10-10',
      notesCount: 3,
    },
    {
      id: 'top-ai-2',
      subjectId: 'sub-ai',
      title: 'Markov Decision Processes & Value Iteration',
      confidence: 'learning',
      lastReviewedDate: '2026-09-23',
      nextReviewDate: '2026-09-27', // Due today
      notesCount: 4,
    },

    // ML topics
    {
      id: 'top-ml-1',
      subjectId: 'sub-ml',
      title: 'Policy Gradient Methods (REINFORCE & PPO)',
      confidence: 'needs_practice',
      lastReviewedDate: '2026-09-21',
      nextReviewDate: '2026-09-27', // Due today
      handbookUrl: 'https://notes.robotics/handbook/ml/policy-gradients',
      notesCount: 7,
    },
    {
      id: 'top-ml-2',
      subjectId: 'sub-ml',
      title: 'Vision Transformers (ViT) for Robot Manipulation',
      confidence: 'not_studied',
      nextReviewDate: '2026-09-30',
      notesCount: 1,
    }
  ],

  tasks: [
    {
      id: 'task-1',
      semesterId: 'sem-current',
      subjectId: 'sub-rob',
      title: 'Implement 6-DOF Damped Least Squares IK in C++',
      description: 'Write damped pseudoinverse solver to handle kinematic singularities during trajectory tracking.',
      dueDate: '2026-09-27',
      priority: 'high',
      estimatedMinutes: 90,
      status: 'in_progress',
      isImportant: true,
      scheduledDate: '2026-09-27',
      subtasks: [
        { id: 'sub-1a', title: 'Derive manipulator Jacobian matrix in symbolic form', completed: true },
        { id: 'sub-1b', title: 'Implement damping factor adaptive tuning', completed: true },
        { id: 'sub-1c', title: 'Benchmark execution time against Pinocchio library', completed: false },
      ]
    },
    {
      id: 'task-2',
      semesterId: 'sem-current',
      subjectId: 'sub-math',
      title: 'KKT Duality Proofs & Problem Set 3',
      description: 'Complete questions 4-7 on convex quadratic programming with equality constraints.',
      dueDate: '2026-09-26', // Overdue! Must deal with!
      priority: 'high',
      estimatedMinutes: 120,
      status: 'todo',
      isImportant: true,
      scheduledDate: '2026-09-27',
      subtasks: [
        { id: 'sub-2a', title: 'Derive Lagrangian dual for box-constrained QP', completed: false },
        { id: 'sub-2b', title: 'Verify Slater condition holds for primal', completed: false }
      ]
    },
    {
      id: 'task-3',
      semesterId: 'sem-current',
      subjectId: 'sub-ml',
      title: 'Train PPO Agent on MuJoCo HalfCheetah',
      description: 'Tune generalized advantage estimation (GAE) lambda and discount factor gamma.',
      dueDate: '2026-09-29',
      priority: 'medium',
      estimatedMinutes: 60,
      status: 'todo',
      isImportant: false,
      scheduledDate: '2026-09-27',
      subtasks: [
        { id: 'sub-3a', title: 'Set up tensorboard logging for clipping ratio', completed: true },
        { id: 'sub-3b', title: 'Run 5 seeds across 1M timesteps', completed: false }
      ]
    },
    {
      id: 'task-4',
      semesterId: 'sem-current',
      subjectId: 'sub-ai',
      title: 'Read paper: Real-Time Planning with Heuristic Search on Graphs',
      description: 'Take personal notes on graph contraction heuristics for dynamic obstacle avoidance.',
      dueDate: '2026-10-02',
      priority: 'low',
      estimatedMinutes: 45,
      status: 'todo',
      isImportant: false,
      scheduledDate: undefined,
      subtasks: []
    },
    {
      id: 'task-5',
      semesterId: 'sem-current',
      subjectId: 'sub-rob',
      title: 'Calibrate RealSense D435 camera extrinsics',
      description: 'Perform hand-eye calibration with ChArUco board on UR5e robot flange.',
      dueDate: '2026-09-25', // Overdue!
      priority: 'high',
      estimatedMinutes: 75,
      status: 'blocked',
      isImportant: true,
      scheduledDate: undefined,
      subtasks: [
        { id: 'sub-5a', title: 'Print 30mm ChArUco grid target', completed: true },
        { id: 'sub-5b', title: 'Fix lighting glare in robot cell', completed: false }
      ]
    }
  ],

  studySessions: [
    {
      id: 'sess-1',
      date: '2026-09-27',
      startTime: '09:00',
      endTime: '10:30',
      durationMinutes: 90,
      subjectId: 'sub-rob',
      topicId: 'top-rob-2',
      taskId: 'task-1',
      notes: 'Implemented numerical Jacobian transpose solver and validated convergence on 3-link planar arm.'
    },
    {
      id: 'sess-2',
      date: '2026-09-27',
      startTime: '11:15',
      endTime: '12:15',
      durationMinutes: 60,
      subjectId: 'sub-math',
      topicId: 'top-math-1',
      taskId: 'task-2',
      notes: 'Worked on primal-dual interior point method derivation.'
    },
    {
      id: 'sess-3',
      date: '2026-09-26',
      startTime: '14:00',
      endTime: '17:00',
      durationMinutes: 180,
      subjectId: 'sub-ml',
      topicId: 'top-ml-1',
      notes: 'Reviewed actor-critic architectures and clipping bounds in PPO.'
    },
    {
      id: 'sess-4',
      date: '2026-09-25',
      startTime: '10:00',
      endTime: '12:30',
      durationMinutes: 150,
      subjectId: 'sub-ai',
      topicId: 'top-ai-2',
      notes: 'Practiced Bellman optimality equations and policy evaluation.'
    },
    {
      id: 'sess-5',
      date: '2026-09-24',
      startTime: '15:00',
      endTime: '18:00',
      durationMinutes: 180,
      subjectId: 'sub-rob',
      notes: 'ROS2 Humble lifecycle nodes and action client debugging.'
    }
  ],

  quickNotes: [
    {
      id: 'note-1',
      content: 'Ask Prof. Miller if DLS damping factor can be computed based on the minimum singular value of J.',
      subjectId: 'sub-rob',
      createdAt: '2026-09-26T17:20:00Z'
    },
    {
      id: 'note-2',
      content: 'Handbook deriv: double check sign on Coriolis matrix formulation in Craig robotics textbook.',
      subjectId: 'sub-rob',
      createdAt: '2026-09-27T08:45:00Z'
    }
  ]
};
