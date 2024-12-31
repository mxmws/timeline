export const formatDate = (monthValue) => {
    const year = Math.floor(monthValue / 12);
    const month = monthValue % 12;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[month]} ${year}`;
  };
  
export const getTextWidth = (text) => {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.fontSize = '12px';
    span.innerHTML = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
};

export const checkOverlap = (event1, event2) => {
    const event1Start = event1.start;
    const event1End = event1.hasDuration ? event1.start + event1.duration : event1.start + 1;
    const event2Start = event2.start;
    const event2End = event2.hasDuration ? event2.start + event2.duration : event2.start + 1;
    return event1Start < event2End && event1End > event2Start;
};

// Compress timeline data for URL sharing
export const encodeTimelineData = (data) => {
    const minimalData = {
      events: data.events.map(event => ({
        n: event.name,
        c: event.category,
        s: event.start,
        d: event.duration,
        h: event.hasDuration ? 1 : 0,
        i: event.id
      })),
      categories: data.categories.map(cat => ({
        n: cat.name,
        c: cat.color
      })),
      range: {
        s: data.startYear,
        e: data.endYear
      }
    };
    
    return encodeURIComponent(btoa(JSON.stringify(minimalData)));
  };
  
  // Decode timeline data from URL
  export const decodeTimelineData = (encoded) => {
    try {
      const minimalData = JSON.parse(atob(decodeURIComponent(encoded)));
      
      return {
        events: minimalData.events.map(event => ({
          id: event.i,
          name: event.n,
          category: event.c,
          start: event.s,
          duration: event.d,
          hasDuration: event.h === 1
        })),
        categories: minimalData.categories.map(cat => ({
          name: cat.n,
          color: cat.c
        })),
        startYear: minimalData.range.s,
        endYear: minimalData.range.e
      };
    } catch (error) {
      console.error('Failed to decode timeline data:', error);
      return null;
    }
  };
  
  // Generate shareable URL
  export const generateShareableUrl = (data) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const encoded = encodeTimelineData(data);
    return `${baseUrl}?timeline=${encoded}`;
  };