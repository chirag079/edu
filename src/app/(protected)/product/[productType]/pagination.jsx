import { getTotalBooks } from "@/actions/items.actions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default async function PaginationDiv({ currentPage, type }) {
  //   console.log(currentPage);
  const totalItem = await getTotalBooks(type);
  const totalPage = Math.ceil(totalItem / 12);
  const arr = loop(totalPage);
  return (
    <>
      {totalPage > 1 && (
        <Pagination>
          <PaginationContent className="">
            <PaginationItem hidden={currentPage == 1}>
              <PaginationPrevious
                href={
                  currentPage != 1
                    ? `/product/${type}/?page=${currentPage - 1}`
                    : `/product/${type}/?page=1`
                }
              />
            </PaginationItem>
            {arr &&
              arr.map((i) => {
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={i == currentPage}
                      href={`/product/${type}/?page=${i}`}
                    >
                      {i}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

            {/* <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem> */}
            <PaginationItem hidden={currentPage == totalPage}>
              <PaginationNext
                href={
                  currentPage != totalPage
                    ? `/product/${type}/?page=${currentPage * 1 + 1}`
                    : `/product/${type}/?page=${totalPage}`
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}

function loop(total) {
  let array = [];
  for (let i = 1; i <= total; i++) {
    array.push(i);
  }
  return array;
}
