import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { challengesApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Medal,
  Target,
  Code,
  Sparkles,
  Award,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
};

const getDifficultyGlow = (difficulty: string) => {
  const diff = difficulty.toLowerCase();
  if (diff === "hard") return "hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]";
  if (diff === "medium") return "hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]";
  return "hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]";
};

export const Challenges = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: challengesApi.getChallenges,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["challenge-stats"],
    queryFn: challengesApi.getStats,
  });

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ["challenge-leaderboard"],
    queryFn: challengesApi.getLeaderboard,
  });

  // Mutations
  const joinMutation = useMutation({
    mutationFn: (challengeId: number) => challengesApi.joinChallenge(challengeId),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Successfully registered for the challenge!",
      });
      queryClient.invalidateQueries({ queryKey: ["challenge-stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register for this challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoin = (challengeId: number, challengeTitle: string) => {
    joinMutation.mutate(challengeId);
  };

  const handleRemind = (challengeTitle: string) => {
    toast({
      title: "Reminder Set",
      description: `We will notify you when ${challengeTitle} starts!`,
    });
  };

  // Extract top 3 podium entries if available
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600">
              Skill Arenas
            </h1>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-semibold px-2.5 py-0.5 animate-pulse shadow-md">
              <Sparkles size={12} className="mr-1 inline-block" />
              Arena Active
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            Compete in top-tier engineering sprints, show off your talent, and catch the eye of global recruiters.
          </p>
        </div>
      </motion.div>

      {/* Modern Dashboard Stats & Profile Banner */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 overflow-hidden border border-muted-foreground/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">CURRENT STANDINGS</span>
                <h2 className="text-3xl font-bold tracking-tight">Your Combat Profile</h2>
              </div>
              <p className="text-slate-300 max-w-md text-sm leading-relaxed">
                Join live coding challenges. Earn points to climb the ranks and unlock custom badges for your profile representation.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                  <Award size={14} className="text-yellow-400" />
                  <span>3 Achievements Locked</span>
                </div>
              </div>
            </div>

            {/* Circular score display */}
            <div className="relative flex items-center justify-center self-center shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle cx="64" cy="64" r="54" className="stroke-indigo-500" strokeWidth="8" fill="transparent"
                  strokeDasharray="339.3"
                  strokeDashoffset={339.3 - (339.3 * (stats?.total_points ? Math.min(stats.total_points / 5000, 1) : 0.49))}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                {isLoadingStats ? (
                  <Skeleton className="h-6 w-14 bg-white/20" />
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-white">{stats?.total_points ?? 2450}</span>
                )}
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Arena Pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Small stats cards grid */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <Card className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={48} className="text-primary" />
            </div>
            <Trophy className="text-primary mb-2" size={24} />
            <div>
              {isLoadingStats ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <h3 className="text-2xl font-extrabold tracking-tight">{stats?.challenges_won ?? 3}</h3>
              )}
              <p className="text-xs text-muted-foreground mt-1">Challenges Won</p>
            </div>
          </Card>

          <Card className="border border-muted-foreground/10 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target size={48} className="text-emerald-500" />
            </div>
            <Target className="text-emerald-500 mb-2" size={24} />
            <div>
              {isLoadingStats ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <h3 className="text-2xl font-extrabold tracking-tight">{stats?.participated ?? 12}</h3>
              )}
              <p className="text-xs text-muted-foreground mt-1">Sprints Entered</p>
            </div>
          </Card>

          <Card className="col-span-2 border border-muted-foreground/10 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Code size={48} className="text-purple-500" />
            </div>
            <Code className="text-purple-500 mb-2" size={24} />
            <div className="flex items-center justify-between">
              <div>
                {isLoadingStats ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <h3 className="text-2xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400">{stats?.global_rank ?? "#42"}</h3>
                )}
                <p className="text-xs text-muted-foreground mt-1">Global Standing Rank</p>
              </div>
              <Button variant="link" className="text-xs text-purple-500 p-0 h-auto font-semibold">
                Explore Perks <ArrowRight size={12} className="ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Main challenges & leaderboard section */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Challenges list */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">Active Sprints</h2>
            <span className="text-sm font-semibold text-muted-foreground">
              {challenges.length} Available
            </span>
          </div>

          <div className="space-y-4">
            {isLoadingChallenges ? (
              [1, 2, 3].map((n) => (
                <Card key={n} className="border border-muted-foreground/5 bg-card/40">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : challenges.length === 0 ? (
              <Card className="border border-dashed border-border text-center py-12">
                <CardContent>
                  <Trophy size={40} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">No challenges scheduled at the moment.</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Check back later or explore other sections.</p>
                </CardContent>
              </Card>
            ) : (
              challenges.map((challenge) => (
                <Card key={challenge.id} className={`border border-border/60 bg-card/60 backdrop-blur-md transition-all duration-300 ${getDifficultyGlow(challenge.difficulty)} relative overflow-hidden group`}>
                  {/* Subtle top indicator based on difficulty */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    challenge.difficulty.toLowerCase() === 'hard' ? 'bg-rose-500' :
                    challenge.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`} />
                  
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {challenge.title}
                          </h3>
                          <Badge variant="outline" className={`${
                            challenge.status === "Live" 
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                              : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                          } font-medium px-2 py-0.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${challenge.status === "Live" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                            {challenge.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Hosted by <span className="font-semibold text-foreground/80">{challenge.company}</span>
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {(challenge.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 text-[11px] font-medium tracking-wide transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground pt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-slate-400" />
                            {challenge.time_limit || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} className="text-slate-400" />
                            Competitive
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            challenge.difficulty.toLowerCase() === 'hard' ? 'bg-rose-500/10 text-rose-600' :
                            challenge.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 shrink-0 sm:border-l border-border/40 sm:pl-5">
                        <div className="text-right sm:space-y-1">
                          <p className="text-sm text-muted-foreground/80 font-medium">
                            {challenge.ends_in ? `Ends in ${challenge.ends_in}` : challenge.starts_in ? `Starts in ${challenge.starts_in}` : ""}
                          </p>
                        </div>
                        
                        <Button
                          variant={challenge.status === "Live" ? "gradient" : "outline"}
                          size="sm"
                          className="w-full sm:w-auto shadow-md"
                          onClick={() => challenge.status === "Live" ? handleJoin(challenge.id, challenge.title) : handleRemind(challenge.title)}
                          disabled={joinMutation.isPending && joinMutation.variables === challenge.id}
                        >
                          {challenge.status === "Live" ? (
                            <>
                              <Zap size={14} className="mr-1.5" />
                              {joinMutation.isPending && joinMutation.variables === challenge.id ? "Entering..." : "Join Now"}
                            </>
                          ) : (
                            <>
                              Remind Me
                              <ArrowRight size={14} className="ml-1.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>

        {/* Premium Leaderboard with Podium Visualizer */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">Top Command</h2>
            <Trophy size={20} className="text-amber-500" />
          </div>

          <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden relative shadow-lg">
            <CardContent className="p-6 space-y-6">
              
              {/* Podium Visualizer */}
              {!isLoadingLeaderboard && topThree.length > 0 && (
                <div className="flex items-end justify-center gap-2 pt-6 pb-2 px-1 border-b border-border/40">
                  
                  {/* Rank 2 */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-bold text-sm text-slate-800 shadow-md">
                        🥈
                      </div>
                      <span className="text-xs font-bold text-foreground mt-2 truncate w-full text-center">{topThree[1].name}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">{topThree[1].score}</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 h-12 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xs font-extrabold text-slate-400">2nd</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center flex-1 -translate-y-3 scale-105">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-amber-400 flex items-center justify-center font-bold text-base text-white shadow-lg animate-bounce">
                        👑
                      </div>
                      <span className="text-xs font-extrabold text-foreground mt-2 truncate w-full text-center">{topThree[0].name}</span>
                      <span className="text-[10px] font-extrabold text-amber-500 mt-0.5">{topThree[0].score}</span>
                      <div className="w-full bg-gradient-to-b from-amber-500/20 to-amber-500/5 dark:from-amber-500/30 dark:to-transparent border border-amber-500/30 h-16 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xs font-extrabold text-amber-500">1st</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center font-bold text-sm text-orange-800 shadow-md">
                        🥉
                      </div>
                      <span className="text-xs font-bold text-foreground mt-2 truncate w-full text-center">{topThree[2].name}</span>
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">{topThree[2].score}</span>
                      <div className="w-full bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-950 h-9 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xs font-extrabold text-orange-400">3rd</span>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Leaderboard entries */}
              <div className="space-y-2">
                {isLoadingLeaderboard ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))
                ) : leaderboard.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No records yet</p>
                ) : (
                  restOfLeaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30"
                    >
                      <span className="text-sm font-bold w-6 text-center text-muted-foreground">
                        {user.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                      </div>
                      <span className="font-bold text-sm text-primary">
                        {user.score.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Button variant="ghost" className="w-full font-semibold text-xs border border-border/40 hover:bg-muted">
                View Full Leaderboard
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Challenges;
