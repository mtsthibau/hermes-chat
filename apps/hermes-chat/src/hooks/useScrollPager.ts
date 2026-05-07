import { useRef, useEffect, useLayoutEffect, useState } from "react";

interface UseScrollPagerOptions {
  /** Total number of items in the full list. */
  totalCount: number;
  pageSize?: number;
  /**
   * Dependency that changes whenever the full list is externally refreshed
   * (e.g. a new fetch). Used to snap back to the bottom.
   * Pass the list itself or a revision counter.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resetDep: any;
}

interface UseScrollPagerResult<T extends HTMLElement> {
  scrollRef: React.RefObject<T | null>;
  /** Slice start index into the full array. */
  offset: number;
  /** How many items are currently visible. */
  visibleCount: number;
  /** Whether older items are still available to load. */
  hasMore: boolean;
  /** True while a load-more is in progress (for showing a spinner). */
  loadingMore: boolean;
}

/**
 * Handles bottom-anchored, top-triggered lazy loading for a scrollable list.
 *
 * Usage:
 *   const { scrollRef, offset, visibleCount, hasMore } = useScrollPager({
 *     totalCount: messages.length,
 *     resetDep: messages,
 *   });
 *   const visible = messages.slice(offset);
 */
export function useScrollPager<T extends HTMLElement = HTMLDivElement>({
  totalCount,
  pageSize = 30,
  resetDep,
}: UseScrollPagerOptions): UseScrollPagerResult<T> {
  const scrollRef = useRef<T>(null);
  const prevScrollHeightRef = useRef(0);
  const needsRestoreRef = useRef(false);

  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [loadingMore, setLoadingMore] = useState(false);

  const hasMore = visibleCount < totalCount;
  const offset = Math.max(0, totalCount - visibleCount);

  // Reset pager and snap to bottom when the source list changes externally.
  useLayoutEffect(() => {
    setVisibleCount(pageSize);
    setLoadingMore(false);
    needsRestoreRef.current = false;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetDep]);

  // After load-more: scroll just above the old top message so a few new
  // items are visible without jumping all the way to the beginning.
  useLayoutEffect(() => {
    if (needsRestoreRef.current && scrollRef.current) {
      const added = scrollRef.current.scrollHeight - prevScrollHeightRef.current;
      scrollRef.current.scrollTop = Math.max(0, added - 120);
      needsRestoreRef.current = false;
      setLoadingMore(false);
    }
  }, [visibleCount]);

  // When loadingMore becomes true, expand on the next tick so the spinner
  // gets a render cycle before the new items appear.
  useEffect(() => {
    if (!loadingMore) return;
    const id = setTimeout(() => {
      setVisibleCount((c) => c + pageSize);
    }, 0);
    return () => clearTimeout(id);
  }, [loadingMore, pageSize]);

  // Trigger load-more when the user scrolls to the very top.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container || !hasMore || needsRestoreRef.current || loadingMore) return;
      if (container.scrollTop === 0) {
        needsRestoreRef.current = true;
        prevScrollHeightRef.current = container.scrollHeight;
        setLoadingMore(true);
      }
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, pageSize, loadingMore]);

  return { scrollRef, offset, visibleCount, hasMore, loadingMore };
}
