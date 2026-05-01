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
