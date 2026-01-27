import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Medal,
  Target,
  Code,
} from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "React Component Challenge",
    company: "Google",
    difficulty: "Medium",
    difficultyColor: "bg-yellow-100 text-yellow-700",
    timeLimit: "2 hours",
    participants: 1240,
    prize: "$5,000",
    status: "Live",
    statusColor: "bg-green-100 text-green-700",
    tags: ["React", "TypeScript", "CSS"],
    endsIn: "2 days",
  },
  {
    id: 2,
    title: "Algorithm Mastery",
    company: "Meta",
    difficulty: "Hard",
    difficultyColor: "bg-red-100 text-red-700",
    timeLimit: "3 hours",
    participants: 890,
    prize: "$10,000",
    status: "Live",
    statusColor: "bg-green-100 text-green-700",
    tags: ["Data Structures", "Algorithms", "Python"],
    endsIn: "5 days",
  },
  {
    id: 3,
    title: "API Design Sprint",
    company: "Stripe",
    difficulty: "Medium",
    difficultyColor: "bg-yellow-100 text-yellow-700",
    timeLimit: "4 hours",
    participants: 650,
    prize: "$3,000",
    status: "Upcoming",
    statusColor: "bg-primary/10 text-primary",
    tags: ["REST", "GraphQL", "Node.js"],
    startsIn: "1 week",
  },
  {
    id: 4,
    title: "Frontend Performance",
    company: "Vercel",
    difficulty: "Hard",
    difficultyColor: "bg-red-100 text-red-700",
    timeLimit: "6 hours",
    participants: 420,
    prize: "$8,000",
    status: "Upcoming",
    statusColor: "bg-primary/10 text-primary",
    tags: ["Performance", "Web Vitals", "React"],
    startsIn: "2 weeks",
  },
];

const leaderboard = [
  { rank: 1, name: "Alex Chen", score: 2840, badge: "🥇" },
  { rank: 2, name: "Sarah Miller", score: 2720, badge: "🥈" },
  { rank: 3, name: "Mike Johnson", score: 2650, badge: "🥉" },
  { rank: 4, name: "Emily Davis", score: 2580, badge: "" },
  { rank: 5, name: "David Wilson", score: 2490, badge: "" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Challenges = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold">Challenges</h1>
        <p className="text-muted-foreground mt-1">
          Prove your skills and win prizes from top companies
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <Trophy className="mb-2" size={24} />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm opacity-80">Challenges Won</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Target className="mb-2 text-primary" size={24} />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Participated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Medal className="mb-2 text-yellow-500" size={24} />
            <p className="text-2xl font-bold">2,450</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Code className="mb-2 text-accent" size={24} />
            <p className="text-2xl font-bold">#42</p>
            <p className="text-sm text-muted-foreground">Global Rank</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Challenges List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-semibold">Active Challenges</h2>
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <Badge variant="outline" className={challenge.statusColor}>
                        {challenge.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hosted by {challenge.company}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {challenge.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {challenge.timeLimit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {challenge.participants.toLocaleString()} joined
                      </span>
                      <Badge className={challenge.difficultyColor}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gradient">{challenge.prize}</p>
                      <p className="text-xs text-muted-foreground">
                        {challenge.endsIn ? `Ends in ${challenge.endsIn}` : `Starts in ${challenge.startsIn}`}
                      </p>
                    </div>
                    <Button
                      variant={challenge.status === "Live" ? "gradient" : "outline"}
                      size="sm"
                    >
                      {challenge.status === "Live" ? (
                        <>
                          <Zap size={14} />
                          Join Now
                        </>
                      ) : (
                        <>
                          Remind Me
                          <ArrowRight size={14} />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Leaderboard</h2>
                <Trophy className="text-yellow-500" size={20} />
              </div>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      user.rank <= 3 ? "bg-gradient-primary/5" : "hover:bg-muted"
                    } transition-colors`}
                  >
                    <span className="text-lg font-bold w-6 text-center">
                      {user.badge || user.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                    </div>
                    <span className="font-semibold text-primary">
                      {user.score.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View Full Leaderboard
                <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Challenges;
