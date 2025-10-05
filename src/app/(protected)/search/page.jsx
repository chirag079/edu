"use client"; // May need client-side interaction for search/filter later

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Use hooks for client component
import { useSession } from "next-auth/react";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { searchAllItems } from "@/actions/listing.actions";
import ItemCard from "@/components/ItemCard"; // Use the new item card
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define constants for filters
// Ensure no empty strings in these arrays
const ITEM_TYPES = ["Stationary", "Flat/PG", "Restaurant", "Event"].filter(
  Boolean
);
const COLLEGES = ["NSUT", "DTU", "IPU"].filter(Boolean);

// Special values for "all" options
const ALL_TYPES = "all";
const ALL_COLLEGES = "all";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get initial params from URL
  const { data: session, status } = useSession();

  // State for search/filter inputs
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [itemType, setItemType] = useState(
    searchParams.get("itemType") || ALL_TYPES
  );
  const [college, setCollege] = useState(
    session?.user?.college || searchParams.get("college") || ALL_COLLEGES
  ); // Default to user's college if available
  // TODO: Add state for price filters if needed

  // State for results and loading
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchParams) => {
      setError("");
      setIsSearching(true);

      try {
        const fetchedItems = await searchAllItems(searchParams);
        setResults(fetchedItems || []);
        if (!fetchedItems || fetchedItems.length === 0) {
          toast.info("No items found matching your criteria.");
        }
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch items. Please try again.");
        toast.error("Search failed. Please try again later.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  // Function to perform search
  const performSearch = useCallback(async () => {
    // Don't search if all fields are empty/default and it's not the initial search
    if (
      !query &&
      itemType === ALL_TYPES &&
      college === ALL_COLLEGES &&
      hasInitialized
    ) {
      setResults([]);
      return;
    }

    // Update URL
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (itemType !== ALL_TYPES) params.set("itemType", itemType);
    if (college !== ALL_COLLEGES) params.set("college", college);
    router.push(`/search?${params.toString()}`, { scroll: false });

    const searchParamsData = {
      query: query.trim(),
      itemType: itemType !== ALL_TYPES ? itemType : "",
      college: college !== ALL_COLLEGES ? college : "",
    };

    debouncedSearch(searchParamsData);
  }, [query, itemType, college, hasInitialized, router, debouncedSearch]);

  useEffect(() => {
    performSearch();
  }, [searchParams, performSearch]);

  useEffect(() => {
    if (!hasInitialized) {
      performSearch();
      setHasInitialized(true);
    }
  }, [hasInitialized, performSearch]);

  // Handle form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await performSearch();
  };

  // Helper to clear filters
  const clearFilters = () => {
    setQuery("");
    setItemType(ALL_TYPES);
    setCollege(session?.user?.college || ALL_COLLEGES);
    setResults([]);
    setError("");
    router.push("/search", { scroll: false });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  // Redirect if not authenticated (optional, depends on requirements)
  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/search");
    return null; // Render nothing while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
          Browse Items
        </h1>

        {/* Search and Filter Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:items-end md:gap-4"
        >
          {/* Search Input */}
          <div className="flex-grow space-y-1">
            <Label htmlFor="search-query">Search</Label>
            <Input
              id="search-query"
              placeholder="Search by title or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="dark:bg-zinc-700"
            />
          </div>

          {/* Item Type Filter */}
          <div className="space-y-1 min-w-[150px]">
            <Label htmlFor="item-type">Item Type</Label>
            <Select value={itemType} onValueChange={setItemType}>
              <SelectTrigger id="item-type" className="dark:bg-zinc-700">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TYPES}>All Types</SelectItem>
                {ITEM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* College Filter */}
          <div className="space-y-1 min-w-[150px]">
            <Label htmlFor="college">College</Label>
            <Select value={college} onValueChange={setCollege}>
              <SelectTrigger id="college" className="dark:bg-zinc-700">
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_COLLEGES}>All Colleges</SelectItem>
                {COLLEGES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 md:pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              disabled={isSearching}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
            <Button
              type="submit"
              disabled={isSearching}
              className="flex-shrink-0"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <SearchIcon className="h-4 w-4 mr-1" />
              )}{" "}
              Search
            </Button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        {/* Results Section */}
        <div className="min-h-[400px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center pt-10 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Searching for items...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((item) => (
                <ItemCard key={`${item.itemType}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center pt-10 text-gray-500 dark:text-gray-400">
              {query || itemType !== ALL_TYPES || college !== ALL_COLLEGES ? (
                <p>
                  No items found matching your criteria.
                  <br />
                  Try adjusting your filters or search terms.
                </p>
              ) : (
                <p>
                  Start searching by entering keywords or selecting filters.
                  <br />
                  You can search by title, description, or use the filters
                  above.
                </p>
              )}
            </div>
          )}
          {/* TODO: Add Pagination Controls */}
        </div>
      </div>
    </div>
  );
}
