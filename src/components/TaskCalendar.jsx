import React, { useState, useEffect, useCallback } from "react";
import '@fontsource/space-mono';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const YOUTUBE_API_KEY = import.meta.env.PUBLIC_YOUTUBE_API_KEY;
const CHANNEL_ID = "UCkTzR0N9_r529Zo0CfPNaRA"; // @trypablo channel ID
const CACHE_EXPIRY_HOURS = 12; // Cache expiry in hours

const TaskCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 8, 1)); // September 2024
  const [videos, setVideos] = useState({});
  const [hoveredDay, setHoveredDay] = useState(null);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

  const isCacheExpired = (timestamp) => {
    const now = new Date();
    const cacheTime = new Date(timestamp);
    const differenceInHours = (now - cacheTime) / (1000 * 60 * 60);
    return differenceInHours > CACHE_EXPIRY_HOURS;
  };

  const fetchVideos = useCallback(async () => {
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

    // Check if data exists in localStorage
    const cachedData = localStorage.getItem(monthKey);
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      if (!isCacheExpired(parsedCache.timestamp)) {
        console.log("Using cached data from localStorage for", monthKey);
        setVideos(parsedCache.videos);
        return;
      } else {
        console.log("Cache expired for", monthKey);
        localStorage.removeItem(monthKey); // Remove expired cache
      }
    }

    // If no valid cache, fetch new data
    const startDate = new Date(
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1)
    ).toISOString();
    const endDate = new Date(
      Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59
      )
    ).toISOString();

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&order=date&publishedAfter=${startDate}&publishedBefore=${endDate}&maxResults=50&key=${YOUTUBE_API_KEY}`;

    try {
      console.log("Fetching YouTube data for", monthKey);
      const response = await fetch(url);
      const data = await response.json();
      console.log("Fetched data:", data);

      const videoMap = {};
      data.items.forEach((item) => {
        const publishedDate = new Date(item.snippet.publishedAt);
        const localDate = new Date(
          publishedDate.toLocaleString("en-US", {
            timeZone: "America/Santiago",
          })
        );
        const day = localDate.getDate();
        videoMap[day] = {
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
          videoId: item.id.videoId,
        };
      });

      setVideos(videoMap);

      // Cache the data in localStorage with a timestamp
      localStorage.setItem(
        monthKey,
        JSON.stringify({
          videos: videoMap,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error fetching YouTube data:", error);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    if (newDate >= new Date(2024, 8, 1)) {
      // Don't go before September 2024
      setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const isInitialMonth =
    currentDate.getFullYear() === 2024 && currentDate.getMonth() === 8;

  return (
    <Card className="w-full max-w-md mx-auto bg-primary-dark text-card-foreground text-white">
      <CardHeader className="flex justify-center items-center relative">
        <button
          onClick={handlePrevMonth}
          className={`absolute left-0 p-2 text-purple-300 hover:text-purple-400 ${
            isInitialMonth ? "invisible" : ""
          }`}
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-['Space_Mono'] text-lg font-bold text-white">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="absolute right-0 p-2 text-purple-300 hover:text-purple-400"
        >
          <ChevronRight size={24} />
        </button>
      </CardHeader>
      <CardContent>
        <div className="font-['Space_Mono'] grid grid-cols-7 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center font-bold text-purple-300">
              {day}
            </div>
          ))}
          {Array.from({ length: adjustedFirstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-8"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const hasVideo = videos[day];
            return (
              <div
                key={day}
                className={`h-8 flex items-center justify-center rounded relative
                                    ${
                                      hasVideo
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-800 text-gray-300"
                                    }`}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {day}
                {hoveredDay === day && hasVideo && (
                  <div className="absolute z-10 top-0 right-full mb-2 p-3 bg-gray-900 rounded-lg shadow-xl w-48">
                    <a
                      href={`https://www.youtube.com/watch?v=${videos[day].videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={videos[day].thumbnail}
                        alt={videos[day].title}
                        className="w-full h-auto rounded"
                      />
                    </a>
                    <p className="text-xs text-white mt-2">
                      {videos[day].title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCalendar;
