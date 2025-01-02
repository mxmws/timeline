import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CATEGORIES, EXAMPLE_EVENTS, PLEASANT_COLORS } from './constants';
import { useTimelineInteractions } from './hooks';
import { formatDate, getTextWidth, checkOverlap } from './utils';
import { encodeTimelineData, decodeTimelineData, generateShareableUrl } from './utils';


const LifeTimeline = () => {

  const initializeEventsWithRows = (events, existingEvents = []) => {
    const eventsByCategory = {};
    const processedEvents = [...existingEvents];
    const newEvents = events.filter(event => !existingEvents.find(e => e.id === event.id));

    // Process new events
    newEvents.forEach(event => {
      if (!eventsByCategory[event.category]) {
        eventsByCategory[event.category] = [];
      }

      // Use existing row if provided, otherwise find first available row
      if (event.row !== undefined) {
        processedEvents.push(event);
      } else {
        let row = 0;
        let foundRow = false;

        while (!foundRow) {
          const hasOverlap = processedEvents
            .filter(e => e.category === event.category)
            .some(existingEvent => existingEvent.row === row && checkOverlap(event, existingEvent));

          if (!hasOverlap) {
            foundRow = true;
          } else {
            row++;
          }
        }

        processedEvents.push({
          ...event,
          row
        });
      }
    });

    return processedEvents;
  };
  const [events, setEvents] = useState(() => initializeEventsWithRows(EXAMPLE_EVENTS));
  const [categories, setCategories] = useState(CATEGORIES);
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 7);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [newEvent, setNewEvent] = useState({ name: '', category: '', hasDuration: true });
  const [showInput, setShowInput] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [hoveredCategoryName, setHoveredCategoryName] = useState(null);
  const [hoveredEventDetails, setHoveredEventDetails] = useState(null);
  const [isTimelineHovered, setIsTimelineHovered] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [keepCategories, setKeepCategories] = useState(true);
  const [shareUrl, setShareUrl] = useState('');

  const adjustYear = (type, increment) => {
    if (type === 'start') {
      const newStartYear = startYear + increment;
      // For start year: can decrease freely, but can only increase up to end year
      if (increment < 0 || newStartYear <= endYear) {
        setStartYear(newStartYear);
      }
    } else {
      const newEndYear = endYear + increment;
      // For end year: can increase freely, but can only decrease down to start year
      if (increment > 0 || newEndYear >= startYear) {
        setEndYear(newEndYear);
      }
    }
  };


  const deleteAllEvents = useCallback(() => {
    setEvents([]);
    if (!keepCategories) {
      setCategories([]);
    }
    setShowDeleteConfirmation(false);
    setKeepCategories(true); // Reset to default after operation
  }, [setEvents, keepCategories]);

  const handleAddEventClick = (e, categoryName) => {
    e.stopPropagation();
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Dialog dimensions (approximate)
    const dialogWidth = 256; // 64 * 4 = 256px (w-64)
    const dialogHeight = 200; // approximate height

    // Position to the left of the button by default
    let x = rect.left - containerRect.left - dialogWidth - 8; // 8px gap
    let y = rect.top - containerRect.top;

    // If not enough space on the left, place to the right
    if (x < 0) {
      x = rect.right - containerRect.left + 8;
    }

    // If not enough space below, move up
    const spaceBottom = window.innerHeight - rect.top;
    if (spaceBottom < dialogHeight + 20) {
      y = Math.max(0, rect.bottom - containerRect.top - dialogHeight);
    }

    setDialogPosition({ x, y });
    setShowInput(categoryName);
  };


  const addCategory = useCallback(() => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name === newCategoryName.trim())) {
      alert('This category already exists');
      return;
    }

    // Use the next available color from our palette, or cycle back to the beginning
    const nextColorIndex = categories.length % PLEASANT_COLORS.length;

    const newCategory = {
      name: newCategoryName.trim(),
      color: PLEASANT_COLORS[nextColorIndex]
    };

    setCategories(prevCategories => [...prevCategories, newCategory]);
    setNewCategoryName('');
    setIsAddingCategory(false);
  }, [newCategoryName, categories]);


  const timelineRange = useMemo(() => ({
    start: startYear * 12,
    end: (endYear + 1) * 12 - 1
  }), [startYear, endYear]);

  const {
    containerRef,
    handleMouseInteraction,
    calculatePixelsPerMonth,
    containerWidth
  } = useTimelineInteractions(events, setEvents, timelineRange, setHoveredEventDetails);


  const addEvent = useCallback((category) => {
    if (!newEvent.name) {
      alert('Please enter an event name');
      return;
    }

    const startMonth = Math.floor((timelineRange.start + timelineRange.end) / 2);
    const newEventObj = {
      name: newEvent.name,
      start: startMonth,
      category,
      id: Date.now(),
      hasDuration: newEvent.hasDuration,
      duration: newEvent.hasDuration ? Math.max(1, Math.floor((timelineRange.end - timelineRange.start) / 6)) : 1
    };

    setEvents(prevEvents => initializeEventsWithRows([newEventObj], prevEvents));
    setNewEvent({ name: '', category: '', hasDuration: true });
    setShowInput(null);
  }, [newEvent, timelineRange]);


  const deleteEvent = useCallback((eventId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    setSelectedEventId(null);
  }, []);

  const deleteCategory = useCallback((categoryName) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.name !== categoryName)
    );
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.category !== categoryName)
    );
    setSelectedCategory(null);
    setCategoryToDelete(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category, .event')) {
        setSelectedEventId(null);
        setSelectedCategory(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Load timeline from URL if present
    const params = new URLSearchParams(window.location.search);
    const timelineData = params.get('timeline');

    if (timelineData) {
      const decoded = decodeTimelineData(timelineData);
      if (decoded) {
        setEvents(initializeEventsWithRows(decoded.events));
        setCategories(decoded.categories);
        setStartYear(decoded.startYear);
        setEndYear(decoded.endYear);
      }
    }
  }, []);

  const handleShare = () => {
    const timelineData = {
      events,
      categories,
      startYear,
      endYear
    };

    const url = generateShareableUrl(timelineData);
    setShareUrl(url);

    // Copy to clipboard
    navigator.clipboard.writeText(url)
      .then(() => alert('Share URL copied to clipboard!'))
      .catch(() => alert('Failed to copy URL. The share URL has been generated but could not be copied automatically.'));
  };

  const calculateEndDate = (startMonth, duration) => {
    return startMonth + duration;
  };

  const renderTimelineMarkers = useCallback(() => {
    if (!containerWidth) return [];

    const pixelsPerMonth = calculatePixelsPerMonth();
    const timelineMarkers = [];
    const monthsInYear = 12;

    for (let currentMonth = timelineRange.start; currentMonth <= timelineRange.end; currentMonth += monthsInYear) {
      const year = Math.floor(currentMonth / monthsInYear);
      const dateOffset = ((currentMonth - timelineRange.start) * pixelsPerMonth);

      // Center the year label between the lines
      const labelOffset = dateOffset + (pixelsPerMonth * (monthsInYear / 2));

      timelineMarkers.push(
        <div
          key={`line-${year}`}
          className="absolute border-l border-gray-300 h-full"
          style={{ left: `${dateOffset}px` }}
        />
      );

      timelineMarkers.push(
        <span
          key={`year-${year}`}
          className="absolute text-xs text-gray-500"
          style={{
            left: `${labelOffset}px`,
            top: '50%',
            transform: 'translate(-50%, -50%)', // Centers horizontally and vertically
            position: 'absolute',
          }}
        >
          {year}
        </span>
      );
    }

    return timelineMarkers;
  }, [timelineRange, containerWidth, calculatePixelsPerMonth]);


  const renderEventsWithButtons = () => {
    const pixelsPerMonth = calculatePixelsPerMonth();

    const calculateEventPositions = (events) => {
      const eventsByCategory = {};
      const pixelsPerMonth = calculatePixelsPerMonth();

      events.forEach(event => {
        const eventStartMonth = event.start;
        const eventEndMonth = event.hasDuration
          ? (event.start + (event.duration || 1))
          : event.start + 1;

        const isOverlapping = eventStartMonth <= timelineRange.end && eventEndMonth >= timelineRange.start;
        if (!isOverlapping) return;

        const visibleStartMonth = Math.max(eventStartMonth, timelineRange.start);
        const visibleEndMonth = Math.min(eventEndMonth, timelineRange.end);

        const dateOffset = event.hasDuration
          ? ((visibleStartMonth - timelineRange.start) * pixelsPerMonth)
          : ((visibleStartMonth - timelineRange.start) * pixelsPerMonth) + (pixelsPerMonth / 2) - 10;

        const eventWidth = event.hasDuration
          ? ((visibleEndMonth - visibleStartMonth) * pixelsPerMonth)
          : 20;

        if (!eventsByCategory[event.category]) {
          eventsByCategory[event.category] = [];
        }

        const textWidth = event.hasDuration ? eventWidth : getTextWidth(event.name);
        const centerPoint = event.hasDuration
          ? dateOffset + (eventWidth / 2)
          : dateOffset + 10;

        const textPosition = {
          center: centerPoint,
          left: centerPoint - (textWidth / 2),
          right: centerPoint + (textWidth / 2),
          width: textWidth
        };

        eventsByCategory[event.category].push({
          ...event,
          eventStartMonth,
          eventEndMonth,
          dateOffset,
          eventWidth,
          row: event.row || 0,
          visibleStartMonth,
          visibleEndMonth,
          textPosition
        });
      });

      return eventsByCategory;
    };

    const eventPositions = calculateEventPositions(events);

    return (
      <div className="w-full max-w-full">
        {categories.map((category) => {
          const maxRow = eventPositions[category.name]
            ? Math.max(...eventPositions[category.name].map(event => event.row))
            : 0;

          return (
            <div
              key={category.name}
              className="items-center space-x-4 mb-0 category"
              style={{
                height: `${50 + ((maxRow + 1) * 45)}px`,
                position: 'relative',
                border: '1px solid #f0f0f0',
                padding: '10px 0'
              }}
              onClick={() =>
                setSelectedCategory((prev) => (prev === category.name ? null : category.name))
              }
              onMouseEnter={() => setHoveredCategoryName(category.name)}
              onMouseLeave={() => setHoveredCategoryName(null)}
            >
              <div className="absolute top-0 left-0 w-full bg-gray-100 p-2 cursor-pointer">
                <div className="font-bold text-sm text-gray-500">{category.name}</div>
              </div>


              <div
                className="absolute top-12 right-0 w-full"
                style={{ height: `${((maxRow + 1) * 45)}px` }}
              >
                {(eventPositions[category.name] || []).map((event) => (
                  <div
                    key={event.id}
                    className="absolute"
                    style={{
                      left: `${event.dateOffset}px`,
                      top: `${event.row * 45}px`,
                    }}
                  >
                    {!event.hasDuration ? (
                      <div
                        className="flex flex-col items-center justify-center cursor-move"
                        style={{
                          width: '20px',
                          position: 'relative'
                        }}
                        onMouseDown={(e) => handleMouseInteraction(e, event.id, 'move')}
                        onClick={(e) => {
                          if (e.target.closest('.resize-handle')) return;
                          setSelectedEventId((prev) => (prev === event.id ? null : event.id));
                        }}
                        onMouseEnter={() => {
                          setHoveredEventDetails({
                            name: event.name,
                            startDate: formatDate(event.start),
                          });
                          setHoveredEventId(event.id);
                        }}
                        onMouseLeave={() => {
                          setHoveredEventDetails(null);
                          setHoveredEventId(null);
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: category.color,
                            border: '2px solid currentColor',
                          }}
                        />
                        {/* Always show the label */}
                        <div
                          className="text-xs mt-2 absolute whitespace-nowrap bg-white px-1 rounded shadow-sm"
                          style={{
                            left: '50%',
                            transform: 'translateX(-50%)',
                            top: '5px',
                            textAlign: 'center',
                            zIndex: hoveredEventId === event.id ? 50 : 1,
                          }}
                        >
                          {event.name}
                        </div>
                        {hoveredEventId === event.id && (
                          <button
                            className="text-gray-500 hover:text-red-600 text-xs absolute"
                            style={{
                              left: '50%',
                              transform: 'translateX(-50%)',
                              top: '27px',
                              zIndex: 40,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        className="rounded overflow-hidden flex items-center event"
                        style={{
                          width: `${event.eventWidth}px`,
                          height: '40px',
                          backgroundColor: category.color,
                          opacity: 1,
                          border: '2px solid currentColor'
                        }}
                        onClick={(e) => {
                          if (e.target.closest('.resize-handle')) return;
                          setSelectedEventId((prev) => prev === event.id ? null : event.id);
                        }}
                        onMouseEnter={() => {
                          setHoveredEventDetails({
                            name: event.name,
                            startDate: formatDate(event.start),
                            endDate: formatDate(event.start + (event.duration || 1) - 1)
                          });
                          setHoveredEventId(event.id);
                        }}
                        onMouseLeave={() => {
                          setHoveredEventDetails(null);
                          setHoveredEventId(null);
                        }}
                      >
                        <div
                          className="flex-grow p-1 text-xs text-black cursor-move w-full h-full 
                            line-clamp-2 overflow-hidden break-words"
                          onMouseDown={(e) => handleMouseInteraction(e, event.id, 'move')}
                        >
                          {event.name}
                        </div>

                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize resize-handle"
                          onMouseDown={(e) => handleMouseInteraction(e, event.id, 'resize-left')}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize resize-handle"
                          onMouseDown={(e) => handleMouseInteraction(e, event.id, 'resize-right')}
                        />

                        {hoveredEventId === event.id && (
                          <button
                            className="absolute top-1 right-1 text-gray-500 hover:text-red-600 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {hoveredCategoryName === category.name && (
                <>
                  <button
                    className="absolute top-1 right-1 text-gray-500 hover:text-red-600 text-xs w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryToDelete(category.name); // Changed from deleteCategory(category.name)
                    }}
                  >
                    ✕
                  </button>
                  <button
                    className="absolute top-1 right-7 text-gray-500 hover:text-blue-600 text-2xl w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                    onClick={(e) => handleAddEventClick(e, category.name)}
                    style={{ opacity: hoveredCategoryName === category.name ? 1 : 0 }}
                  >
                    +
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen p-4"
      style={{ width: '100vw' }}
    >
      <div className="w-full max-w-[1600px] mx-auto">


        {/* Delete All Events Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-xl mb-4">Confirm Delete</h2>
              <p className="mb-4">Are you sure you want to delete all events? This action cannot be undone.</p>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="keepCategories"
                  checked={keepCategories}
                  onChange={(e) => setKeepCategories(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="keepCategories">Keep categories</label>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={deleteAllEvents}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                >
                  Delete All
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setKeepCategories(true); // Reset to default when canceling
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Category Confirmation Modal */}
        {categoryToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-xl mb-4">Confirm Delete Category</h2>
              <p className="mb-4">Are you sure you want to delete the category "{categoryToDelete}"? This will also delete all events in this category and cannot be undone.</p>
              <div className="flex justify-between">
                <button
                  onClick={() => deleteCategory(categoryToDelete)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                >
                  Delete Category
                </button>
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}




        <div className="bg-gray-100 p-4 mb-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {[
                { label: 'Start Year', value: startYear, type: 'start' },
                { label: 'End Year', value: endYear, type: 'end' },
              ].map(({ label, value, type }) => (
                <div key={label} className="flex flex-col items-center mx-4">
                  <span className="text-sm mb-1">{label}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                      onClick={() => adjustYear(type, -1)}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm border rounded">{value}</span>
                    <button
                      className="px-3 py-1 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                      onClick={() => adjustYear(type, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}          </div>

            {hoveredEventDetails ? (
              <div className="text-center">
                <div className="font-semibold">{hoveredEventDetails.name}</div>
                <div>
                  {hoveredEventDetails.endDate
                    ? `${hoveredEventDetails.startDate} - ${hoveredEventDetails.endDate}`
                    : hoveredEventDetails.startDate}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">Hover over an event to see details</div>
            )}

            <div className="flex space-x-2">
              <button
                className="text-sm text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                onClick={handleShare}
              >
                Share Timeline
              </button>
              <button
                className="text-sm text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete All Events
              </button>
            </div>
          </div>
        </div>





        <div
          ref={containerRef}
          className="border rounded-lg relative w-full"
          style={{ height: '800px' }}
          onMouseEnter={() => setIsTimelineHovered(true)}
          onMouseLeave={() => setIsTimelineHovered(false)}
        >
          <div className="relative h-8 border-b border-gray-300 w-full">
            {containerWidth > 0 && renderTimelineMarkers()}
          </div>

          <div className="relative overflow-y-auto" style={{ height: 'calc(100% - 30px)' }}>
            <div className="min-h-full px-0 py-0">
              {containerWidth > 0 && renderEventsWithButtons()}
            </div>
          </div>

          {/* Add Event Input */}
          {showInput && (
            <div
              className="absolute p-4 w-64 bg-white shadow-lg rounded z-50"
              style={{
                left: `${dialogPosition.x}px`,
                top: `${dialogPosition.y}px`,
              }}
            >
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    name: e.target.value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addEvent(showInput);
                  }
                }}
                placeholder="Event Name"
                className="border p-2 rounded w-full"
              />

              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="hasDuration"
                  checked={newEvent.hasDuration}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      hasDuration: e.target.checked
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="hasDuration">Event has duration</label>
              </div>

              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => addEvent(showInput)}
                  className="flex-grow bg-blue-500 text-white p-2 rounded"
                >
                  Add Event
                </button>
                <button
                  onClick={() => {
                    setShowInput(null);
                    setNewEvent({ name: '', category: '', hasDuration: true });
                  }}
                  className="flex-grow bg-gray-300 text-black p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Category Button */}
          <div className="absolute bottom-4 right-8">
            <button
              className={`text-white bg-gray-800 hover:text-blue-600 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-opacity duration-200 ${isTimelineHovered ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setIsAddingCategory(true)}
              aria-label="Add Category"
            >
              +
            </button>
          </div>

          {/* New Category Input Modal */}
          {isAddingCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-xl mb-4">Add New Category</h2>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCategory();
                    }
                  }}
                  placeholder="Enter category name"
                  className="border p-2 rounded w-full mb-4"
                />
                <div className="flex justify-between">
                  <button
                    onClick={addCategory}
                    className="bg-blue-500 text-white p-2 rounded mr-2"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="bg-gray-300 text-black p-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeTimeline;