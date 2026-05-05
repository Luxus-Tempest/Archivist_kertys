import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export const formatRelativeDate = (dateString?: string) => {
    if (!dateString || dateString === "NOW") return "à l'instant";
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (e) {
      return dateString;
    }
  };

export const formatDateWithTime = (dateString: string, lng: string) => {
  try {
    const d = new Date(dateString.replace(' ', 'T'));
    
    if (isNaN(d.getTime())) return dateString;

    const time = new Intl.DateTimeFormat(lng, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);

    const date = new Intl.DateTimeFormat(lng, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(d);

    return `${date} - ${time}`;
  } catch (e) {
    return dateString;
  }
};