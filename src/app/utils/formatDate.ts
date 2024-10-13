export const formatDate = (
  dateString: Date,
  timeZone: string = "UTC"
): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone, // Ensures it's formatted based on the desired time zone
    timeZoneName: "short",
  };

  return new Intl.DateTimeFormat(undefined, options).format(date);
};
