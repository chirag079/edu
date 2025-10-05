"use client";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function SearchBar() {
  const [search, setsearch] = useState("");
  const [tags, settags] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const searchParam = new URLSearchParams(params);
  function modifySearchParam() {
    if (searchParam.get("name")) {
      //   console.log("first");
      searchParam.delete("name");
      //   searchParam.set("name", search);
      return;
    }
    return;
  }

  return (
    <div className="flex w-full max-w-sm items-center  space-x-2 ">
      <Input
        value={search}
        onChange={(event) => {
          setsearch(event.target.value);
        }}
        type="string"
        placeholder="search item by their name "
      />
      {/* <button ></button> */}
      {/* <Link href={pathname + "?" + searchParam + `&name=${search}`}> */}
      <Button
        type="submit"
        disabled={search.length <= 2}
        className={search.length <= 2 ? "disabled" : ""}
        onClick={() => {
          modifySearchParam();
          const route =
            pathname +
            `${
              searchParam
                ? "?" + searchParam + "&name=" + search
                : "?name=" + search
            }`;

          router.push(route);
        }}
      >
        Search
      </Button>
      {/* </Link> */}
    </div>
  );
}

export default SearchBar;
