import { useState, useRef, useEffect, useCallback } from 'react';
import { formatDate, checkOverlap } from './utils';

export function useTimelineInteractions(
  events, 
  setEvents, 
  timelineRange, 
  setHoveredEventDetails
) {
  const [interaction, setInteraction] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);
  const rowHeight = 45;
  const eventHeight = 40;
  const originalRowsRef = useRef(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const calculatePixelsPerMonth = useCallback(() => {
    const totalMonths = timelineRange.end - timelineRange.start + 1;
    return containerWidth / totalMonths;
  }, [timelineRange, containerWidth]);

  const findNewRowsForOverlappingEvents = useCallback((modifiedEvent, allEvents) => {
    const eventRows = new Map();
    eventRows.set(modifiedEvent.id, modifiedEvent.row);
    
    const categoryEvents = allEvents.filter(e => 
      e.category === modifiedEvent.category && 
      e.id !== modifiedEvent.id
    );
    
    const sortedEvents = [...categoryEvents].sort((a, b) => a.start - b.start);

    sortedEvents.forEach(event => {
      let row = originalRowsRef.current.get(event.id) ?? event.row;
      let foundRow = false;

      while (!foundRow) {
        const hasOverlap = [...eventRows.entries()].some(([id, eventRow]) => {
          const otherEvent = id === modifiedEvent.id ? modifiedEvent : allEvents.find(e => e.id === id);
          return eventRow === row && checkOverlap(event, otherEvent);
        });

        if (!hasOverlap) {
          foundRow = true;
          eventRows.set(event.id, row);
        } else {
          row++;
        }
      }
    });

    return new Map(allEvents.map(e => [e.id, eventRows.get(e.id) ?? (originalRowsRef.current.get(e.id) ?? e.row)]));
  }, [checkOverlap]);

  const handleMouseInteraction = useCallback((event, eventId, type) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!originalRowsRef.current.size) {
      originalRowsRef.current = new Map(events.map(e => [e.id, e.row]));
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const pixelsPerMonth = calculatePixelsPerMonth();
    const currentEvent = events.find(e => e.id === eventId);
    
    const categoryContainer = event.target.closest('.category');
    const categoryRect = categoryContainer.getBoundingClientRect();
    
    const eventElement = event.target.closest('.event') || event.target.closest('.cursor-move');
    const initialRow = currentEvent.row || 0;
    const mouseOffsetInRow = event.clientY - (categoryRect.top + (initialRow * rowHeight) + (eventHeight / 2));

    setInteraction({
      eventId,
      type,
      startX: event.clientX - containerRect.left,
      initialRow,
      mouseOffsetInRow,
      originalEvent: { ...currentEvent },
      pixelsPerMonth,
      categoryTop: categoryRect.top,
      categoryContainer,
      eventInitialY: categoryRect.top + (initialRow * rowHeight) + (eventHeight / 2)
    });
  }, [events, calculatePixelsPerMonth]);

  const handleMouseMove = useCallback((event) => {
    if (!interaction || !containerRef.current) return;
  
    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = event.clientX - containerRect.left;
    const categoryContainer = interaction.categoryContainer;
    if (!categoryContainer) return;
    
    const eventCenterY = event.clientY - interaction.mouseOffsetInRow;
    const offsetY = eventCenterY - interaction.eventInitialY;
    let newRow = interaction.initialRow + Math.sign(offsetY) * Math.floor(Math.abs(offsetY) / rowHeight);
    newRow = Math.max(0, newRow);

    const deltaPx = currentX - interaction.startX;
    const deltaMonths = Math.round(deltaPx / interaction.pixelsPerMonth);
  
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        if (event.id !== interaction.eventId) return event;
  
        const updatedEvent = { ...interaction.originalEvent };
  
        switch (interaction.type) {
          case 'resize-right':
            if (event.hasDuration) {
              const newDuration = Math.max(1, updatedEvent.duration + deltaMonths);
              updatedEvent.duration = newDuration;
              
              if (setHoveredEventDetails) {
                setHoveredEventDetails({
                  name: event.name,
                  startDate: formatDate(event.start),
                  endDate: formatDate(event.start + (event.duration || 1) - 1)
                });
              }
            }
            break;
  
          case 'resize-left':
            if (event.hasDuration) {
              const potentialNewStart = updatedEvent.start + deltaMonths;
              const potentialNewDuration = updatedEvent.duration - deltaMonths;
              
              if (potentialNewDuration >= 1) {
                updatedEvent.start = potentialNewStart;
                updatedEvent.duration = potentialNewDuration;
                
                if (setHoveredEventDetails) {
                  setHoveredEventDetails({
                    name: event.name,
                    startDate: formatDate(event.start),
                    endDate: formatDate(event.start + (event.duration || 1) - 1)
                  });
                }
              }
            }
            break;
  
          case 'move':
            updatedEvent.start = updatedEvent.start + deltaMonths;
            updatedEvent.row = newRow;
            
            if (setHoveredEventDetails) {
              if (event.hasDuration) {
                setHoveredEventDetails({
                  name: event.name,
                  startDate: formatDate(event.start),
                  endDate: formatDate(event.start + (event.duration || 1) - 1),
                  row: newRow
                });
              } else {
                setHoveredEventDetails({
                  name: event.name,
                  startDate: formatDate(event.start),
                  row: newRow
                });
              }
            }
            break;
  
          default:
            break;
        }
  
        return updatedEvent;
      });

      const modifiedEvent = updatedEvents.find(e => e.id === interaction.eventId);
      const newRows = findNewRowsForOverlappingEvents(modifiedEvent, updatedEvents);
      
      return updatedEvents.map(event => ({
        ...event,
        row: newRows.get(event.id) ?? event.row
      }));
    });
  }, [interaction, setEvents, setHoveredEventDetails, findNewRowsForOverlappingEvents]);

  const handleMouseUp = useCallback(() => {
    if (setHoveredEventDetails) {
      setHoveredEventDetails(null);
    }
    
    setEvents(prevEvents => {
      const modifiedEvent = prevEvents.find(e => e.id === interaction.eventId);
      if (!modifiedEvent) return prevEvents;
      
      const newRows = findNewRowsForOverlappingEvents(modifiedEvent, prevEvents);
      return prevEvents.map(event => ({
        ...event,
        row: newRows.get(event.id) ?? event.row
      }));
    });
    
    originalRowsRef.current = new Map();
    setInteraction(null);
  }, [setHoveredEventDetails, interaction, findNewRowsForOverlappingEvents, setEvents]);

  useEffect(() => {
    if (interaction) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [interaction, handleMouseMove, handleMouseUp]);

  return {
    containerRef,
    handleMouseInteraction,
    calculatePixelsPerMonth,
    containerWidth
  };
}