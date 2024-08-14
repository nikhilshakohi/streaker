import StreakBox from "./StreakBox";
import StreakList from "./StreakList";

export default function Dashboard() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-8 p-4">
      <StreakBox />
      <StreakList />
    </div>
  );
}
