import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useDispatch, useSelector } from "react-redux";
import { setQuery } from "@/modules/directory/screens/SearchScreen/redux/searchSlice";
import type { RootState } from "@/store";
import { Check } from "@/components/ui/Check";
import { IconButton, Input, InputGroup, InputLeftElement, InputRightElement } from "@chakra-ui/react";
import { LAYOUT } from "@/theme/layout";

const DEBOUNCE_MS = 280;

export default function SearchBar({ embedded }: { embedded?: boolean }) {
  const query = useSelector((state: RootState) => state?.search?.query);
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  /** Local text updates every keystroke; Redux updates on debounce (keeps directory filter cheap). */
  const [text, setText] = useState(() => query ?? "");

  const debouncedCommit = useDebouncedCallback((value: string) => {
    dispatch(setQuery(value));
  }, DEBOUNCE_MS);

  /** Keep local input in sync when Redux clears (filters / clear) or rehydrates without overwriting faster typing. */
  useEffect(() => {
    setText((prev) => {
      if (query === "" || query === undefined) return "";
      if (prev) return prev;
      return query;
    });
  }, [query]);

  const dark = !embedded;

  return (
    <InputGroup
      size="md"
      flex={1}
      minW={0}
      w="100%"
      h={LAYOUT.tapMinPx}
      minH={LAYOUT.tapMinPx}
      maxH={LAYOUT.tapMinPx}
      borderRadius="lg"
      bg={dark ? "gray.700" : "gray.100"}
      borderWidth={embedded ? "1px" : "0"}
      borderColor={embedded ? "blackAlpha.200" : undefined}
      overflow="hidden"
    >
      <InputLeftElement pointerEvents="none" h={LAYOUT.tapMinPx} pl={3}>
        <span aria-hidden style={{ fontSize: 16, opacity: dark ? 0.85 : 0.6 }}>
          🔍
        </span>
      </InputLeftElement>
      <Input
        ref={inputRef}
        pl={10}
        pr={10}
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          debouncedCommit(v);
        }}
        placeholder="Search name, number etc"
        variant="unstyled"
        h={LAYOUT.tapMinPx}
        fontSize="md"
        color={dark ? "white" : "gray.900"}
        _placeholder={{ color: dark ? "whiteAlpha.600" : "gray.500" }}
      />
      <Check ifPresent={!!text}>
        <InputRightElement h={LAYOUT.tapMinPx} pr={1}>
          <IconButton
            aria-label="Clear search"
            icon={<span style={{ fontSize: 20, lineHeight: 1 }}>×</span>}
            variant="ghost"
            size="sm"
            borderRadius="md"
            color={dark ? "gray.300" : "gray.600"}
            _hover={{ bg: dark ? "whiteAlpha.200" : "blackAlpha.100" }}
            onClick={() => {
              debouncedCommit.cancel();
              setText("");
              dispatch(setQuery(""));
            }}
          />
        </InputRightElement>
      </Check>
    </InputGroup>
  );
}
