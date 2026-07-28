export const mockStudySessions = {
  machineLearning: {
    sessionId: "sess_ml_101",
    topic: "Machine Learning & Neural Networks",
    category: "Computer Science",
    progressPct: 72,
    estimatedStudyTimeMins: 28,
    statsSummary: {
      conceptsCount: 18,
      flashcardsCount: 35,
      quizQuestionsCount: 10,
      weakAreasCount: 4
    },
    prerequisites: ["Linear Algebra", "Calculus & Derivatives", "Python Fundamentals"],
    conceptNodes: [
      { id: "node_1", label: "Machine Learning", parent: null, level: 0, status: "mastered", desc: "Core umbrella paradigm of data-driven modeling" },
      { id: "node_2", label: "Supervised Learning", parent: "node_1", level: 1, status: "mastered", desc: "Learning from labeled dataset pairs (X, Y)" },
      { id: "node_3", label: "Regression", parent: "node_2", level: 2, status: "mastered", desc: "Predicting continuous numeric target values" },
      { id: "node_4", label: "Classification", parent: "node_2", level: 2, status: "mastered", desc: "Categorizing inputs into discrete class labels" },
      { id: "node_5", label: "Neural Networks", parent: "node_1", level: 1, status: "weak", desc: "Interconnected layers of artificial neurons with non-linear activations" },
      { id: "node_6", label: "Convolutional NN (CNN)", parent: "node_5", level: 2, status: "weak", desc: "Spatial feature extraction using receptive fields & pooling" },
      { id: "node_7", label: "Recurrent NN (RNN)", parent: "node_5", level: 2, status: "review", desc: "Sequential data modeling with hidden state memory" }
    ],
    flashcards: [
      {
        id: "card_1",
        concept: "Neural Networks",
        question: "What is the primary purpose of an activation function in a neural network?",
        answer: "To introduce non-linearity, allowing the network to learn complex non-linear patterns beyond simple linear combinations.",
        difficulty: "Medium",
        category: "Deep Learning"
      },
      {
        id: "card_2",
        concept: "CNN",
        question: "Why are Convolutional Layers superior to Fully Connected layers for image processing?",
        answer: "They preserve spatial relationship topology and dramatically reduce parameter counts through local weight sharing.",
        difficulty: "Hard",
        category: "Computer Vision"
      },
      {
        id: "card_3",
        concept: "Regression",
        question: "How does L1 Regularization (Lasso) differ from L2 Regularization (Ridge)?",
        answer: "L1 adds absolute coefficient weights driving parameters to exact zero (feature selection), while L2 shrinks coefficients continuously.",
        difficulty: "Medium",
        category: "Optimization"
      },
      {
        id: "card_4",
        concept: "Classification",
        question: "What metric is most appropriate for highly imbalanced binary classification datasets?",
        answer: "Precision-Recall AUC or F1-Score, because standard accuracy is misleading when one class dominates.",
        difficulty: "Easy",
        category: "Evaluation"
      }
    ],
    quiz: [
      {
        id: "q_1",
        question: "Which optimizer computes adaptive learning rates for each parameter using first and second moments of gradients?",
        options: [
          "Stochastic Gradient Descent (SGD)",
          "Adam Optimizer",
          "RMSprop",
          "Adagrad"
        ],
        correctIndex: 1,
        explanation: "Adam (Adaptive Moment Estimation) maintains exponential moving averages of both past gradients (1st moment) and squared gradients (2nd moment)."
      },
      {
        id: "q_2",
        question: "In Recurrent Neural Networks, what gradient phenomenon frequently causes training collapse on long sequences?",
        options: [
          "Vanishing / Exploding Gradients",
          "Overfitting on Noise",
          "Saddle Point Traps",
          "Covariate Shift"
        ],
        correctIndex: 0,
        explanation: "Repeated multiplication of weight matrices through backpropagation through time causes gradients to exponentially decay to zero or blow up to infinity."
      },
      {
        id: "q_3",
        question: "What activation function outputs values in the range (-1 to 1) zero-centered?",
        options: [
          "Sigmoid",
          "ReLU",
          "Hyperbolic Tangent (tanh)",
          "Leaky ReLU"
        ],
        correctIndex: 2,
        explanation: "Tanh maps input numbers into (-1, 1), making it zero-centered which helps optimization speed compared to standard Sigmoid."
      }
    ],
    weakTopics: [
      { id: "weak_1", title: "Neural Networks & Activation Functions", reason: "Missed 2 questions on backpropagation derivatives yesterday", estMins: 6 },
      { id: "weak_2", title: "Vanishing Gradients in RNNs", reason: "Flagged for review during flashcard swipe session", estMins: 8 },
      { id: "weak_3", title: "L1 vs L2 Regularization Bounds", reason: "Requires mathematical refresher on weight penalty constraints", estMins: 5 }
    ],
    revisionPlan: [
      { step: 1, title: "Review Non-Linearity & ReLU vs Tanh", time: "4 mins", action: "Concept Card Review" },
      { step: 2, title: "Solve 5 Guided Backprop Derivative Flashcards", time: "6 mins", action: "Interactive Drill" },
      { step: 3, title: "Retest RNN Vanishing Gradient Quiz", time: "5 mins", action: "Targeted Assessment" }
    ]
  }
};
