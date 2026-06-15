import HomeNav from "@/components/Home/home-nav";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";



const HomePage = () => {

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <HomeNav />
      <div className="flex flex-col items-center justify-center pt-20 pb-20 px-4">
        <h1 className="text-4xl font-bold mb-8 text-foreground">How can I help you today?</h1>
        <Textarea
          placeholder="Ask me anything..."
          className="w-full max-w-2xl h-32 text-lg rounded-xl p-4 shadow-lg border-2 focus:border-primary"
        />
      </div>
    </div>
  );
};

export default HomePage;
