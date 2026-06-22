const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Initialize DB table
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('DB initialized');
}
initDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all questions
app.get('/api/questions', (req, res) => {
  const questions = [
    // Docker / Dockerfiles
    {
      id: 1, category: 'Docker',
      question: 'What instruction sets the base image in a Dockerfile?',
      options: ['BASE', 'FROM', 'IMAGE', 'START'],
      answer: 1
    },
    {
      id: 2, category: 'Docker',
      question: 'Which Dockerfile instruction runs a command during the image build?',
      options: ['CMD', 'EXEC', 'RUN', 'START'],
      answer: 2
    },
    {
      id: 3, category: 'Docker',
      question: 'What does the USER instruction in a Dockerfile do?',
      options: ['Creates a new user on the host', 'Sets the user for subsequent RUN/CMD instructions', 'Lists all users', 'Grants root access'],
      answer: 1
    },
    {
      id: 4, category: 'Docker',
      question: 'What is the difference between CMD and ENTRYPOINT?',
      options: ['No difference', 'ENTRYPOINT is always executed; CMD provides defaults', 'CMD is always executed; ENTRYPOINT provides defaults', 'ENTRYPOINT builds the image'],
      answer: 1
    },
    {
      id: 5, category: 'Docker',
      question: 'Which flag makes a docker build use no cache?',
      options: ['--skip-cache', '--no-cache', '--fresh', '--rebuild'],
      answer: 1
    },
    // Kubernetes / OpenShift
    {
      id: 6, category: 'Kubernetes / OpenShift',
      question: 'What is a Pod in Kubernetes?',
      options: ['A virtual machine', 'The smallest deployable unit, containing one or more containers', 'A storage volume', 'A network policy'],
      answer: 1
    },
    {
      id: 7, category: 'Kubernetes / OpenShift',
      question: 'What does a Deployment manage in Kubernetes?',
      options: ['Storage', 'Network rules', 'A desired state for ReplicaSets and Pods', 'DNS entries'],
      answer: 2
    },
    {
      id: 8, category: 'Kubernetes / OpenShift',
      question: 'What is a HorizontalPodAutoscaler (HPA) used for?',
      options: ['Scaling storage volumes', 'Automatically scaling pods based on metrics', 'Managing secrets', 'Routing traffic'],
      answer: 1
    },
    {
      id: 9, category: 'Kubernetes / OpenShift',
      question: 'What OpenShift resource exposes a service to the internet?',
      options: ['Ingress', 'Route', 'Gateway', 'Expose'],
      answer: 1
    },
    {
      id: 10, category: 'Kubernetes / OpenShift',
      question: 'What is the purpose of a Kubernetes Secret?',
      options: ['Encrypting all cluster traffic', 'Storing sensitive data like passwords and tokens', 'Hiding pod logs', 'Locking namespaces'],
      answer: 1
    },
    // CI/CD Pipelines
    {
      id: 11, category: 'CI/CD',
      question: 'What does CI stand for in CI/CD?',
      options: ['Container Integration', 'Continuous Integration', 'Cluster Initialization', 'Code Inspection'],
      answer: 1
    },
    {
      id: 12, category: 'CI/CD',
      question: 'In GitLab CI, where do you define pipeline stages and jobs?',
      options: ['Dockerfile', '.gitlab-ci.yml', 'pipeline.json', 'ci-config.yaml'],
      answer: 1
    },
    {
      id: 13, category: 'CI/CD',
      question: 'What triggers a GitLab CI pipeline by default?',
      options: ['A manual button click', 'A push to a branch', 'A scheduled cron job', 'An admin approval'],
      answer: 1
    },
    {
      id: 14, category: 'CI/CD',
      question: 'What is an artifact in a CI/CD pipeline?',
      options: ['A failed job', 'A file or folder produced by a job and passed to later stages', 'A container registry', 'A deployment rollback'],
      answer: 1
    },
    {
      id: 15, category: 'CI/CD',
      question: 'What is the purpose of the "only" keyword in GitLab CI?',
      options: ['Restricts which files are built', 'Defines on which branches/events a job runs', 'Limits CPU usage', 'Filters log output'],
      answer: 1
    },
    // Networking / Services & Routes
    {
      id: 16, category: 'Networking',
      question: 'What Kubernetes Service type exposes a service only within the cluster?',
      options: ['NodePort', 'LoadBalancer', 'ClusterIP', 'ExternalName'],
      answer: 2
    },
    {
      id: 17, category: 'Networking',
      question: 'What port does a ClusterIP Service use for internal communication by default?',
      options: ['The port defined in the Service spec', '80 always', '443 always', '8080 always'],
      answer: 0
    },
    {
      id: 18, category: 'Networking',
      question: 'How does a Pod communicate with another Service in the same namespace?',
      options: ['Using its external IP', 'Using the Service name as hostname', 'Only via Ingress', 'Using the node IP'],
      answer: 1
    },
    {
      id: 19, category: 'Networking',
      question: 'What protocol does an OpenShift Route terminate by default for HTTPS traffic?',
      options: ['TCP passthrough', 'TLS at the router (edge termination)', 'mTLS always', 'No TLS support'],
      answer: 1
    },
    {
      id: 20, category: 'Networking',
      question: 'What is the purpose of a NetworkPolicy in Kubernetes?',
      options: ['Load balancing between pods', 'Controlling which pods can communicate with each other', 'Managing DNS records', 'Assigning IP addresses'],
      answer: 1
    }
  ];
  // Remove answers before sending
  const safeQuestions = questions.map(({ answer, ...q }) => q);
  res.json(safeQuestions);
});

// Submit quiz answers and get score
app.post('/api/submit', (req, res) => {
  const { answers } = req.body;

  const questions = [
    { id: 1, answer: 1 }, { id: 2, answer: 2 }, { id: 3, answer: 1 },
    { id: 4, answer: 1 }, { id: 5, answer: 1 }, { id: 6, answer: 1 },
    { id: 7, answer: 2 }, { id: 8, answer: 1 }, { id: 9, answer: 1 },
    { id: 10, answer: 1 }, { id: 11, answer: 1 }, { id: 12, answer: 1 },
    { id: 13, answer: 1 }, { id: 14, answer: 1 }, { id: 15, answer: 1 },
    { id: 16, answer: 2 }, { id: 17, answer: 0 }, { id: 18, answer: 1 },
    { id: 19, answer: 1 }, { id: 20, answer: 1 }
  ];

  let score = 0;
  const results = questions.map(q => {
    const userAnswer = answers[q.id];
    const correct = userAnswer === q.answer;
    if (correct) score++;
    return { id: q.id, correct, correctAnswer: q.answer, userAnswer };
  });

  res.json({ score, total: questions.length, results });
});

// Save score to leaderboard
app.post('/api/leaderboard', async (req, res) => {
  const { username, score, total, duration_seconds } = req.body;
  if (!username || score === undefined) return res.status(400).json({ error: 'Missing fields' });

  try {
    await pool.query(
      'INSERT INTO leaderboard (username, score, total, duration_seconds) VALUES ($1, $2, $3, $4)',
      [username.trim().substring(0, 50), score, total, duration_seconds]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT username, score, total, duration_seconds, created_at
       FROM leaderboard
       ORDER BY score DESC, duration_seconds ASC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
