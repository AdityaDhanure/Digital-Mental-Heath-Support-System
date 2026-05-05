// Dashboard Welcome Header Component
interface WelcomeHeaderProps {
  userName?: string;
  userRole?: string;
}

export function WelcomeHeader({ userName, userRole }: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDisplayName = (fullName: string | undefined) => {
    if (!fullName) return 'there';
    const nameWithoutPrefix = fullName.replace(/^Dr\.\s+/i, '');
    return nameWithoutPrefix.split(' ')[0];
  };

  const getRoleMessage = () => {
    if (userRole === 'counselor') {
      return 'Your schedule and student sessions are ready';
    }
    return 'Your wellness journey continues here';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 md:p-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">👋</span>
          <span className="text-white/80 text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {getGreeting()}, {getDisplayName(userName)}!
        </h1>
        <p className="text-white/80 text-sm md:text-base">
          {getRoleMessage()}
        </p>
      </div>
    </div>
  );
}
