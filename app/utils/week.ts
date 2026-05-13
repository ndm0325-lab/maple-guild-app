export function getGuildWeekStart(date = new Date()) {
    const d = new Date(date);
  
    d.setHours(0, 0, 0, 0);
  
    const day = d.getDay();
  
    const diff = day >= 4 ? day - 4 : day + 3;
  
    d.setDate(d.getDate() - diff);
  
    return d;
  }