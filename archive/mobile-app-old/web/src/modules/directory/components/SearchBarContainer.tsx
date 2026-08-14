import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { getIfAnyFilterPresent } from "@/utils/utils";
import { Check } from "@/components/ui/Check";
import SearchBar from "./SearchBar";
import { IconSliders } from "@/components/ui/NavIcons";
import { LAYOUT } from "@/theme/layout";
import { Box, Flex, IconButton } from "@chakra-ui/react";

type Props = {
  /** `directory` = under community header (light strip, icon-only filter). */
  variant?: "directory" | "stackSearch";
};

export default function SearchBarContainer({ variant = "directory" }: Props) {
  const navigate = useNavigate();
  const filters = useSelector((state: RootState) => state?.search?.filter);
  const isAnyFilterPresent = getIfAnyFilterPresent(filters);

  const isDirectory = variant === "directory";

  return (
    <Flex
      w="100%"
      align="center"
      gap={isDirectory ? 2.5 : 2}
      minH={isDirectory ? LAYOUT.tapMinPx : undefined}
      bg={isDirectory ? "transparent" : "gray.900"}
      px={isDirectory ? 0 : 2}
      py={isDirectory ? 0 : 2}
    >
      <Box flex="1 1 0%" minW={0} display="flex" alignItems="center">
        <SearchBar embedded={isDirectory} />
      </Box>
      <Box position="relative" flexShrink={0} alignSelf="center">
        <IconButton
          aria-label={isDirectory ? "Open filters" : "Filters"}
          icon={<IconSliders size={22} color={isDirectory ? "#111" : "#333"} />}
          onClick={() => navigate("/search/filters")}
          variant={isDirectory ? "outline" : "solid"}
          bg={isDirectory ? "white" : "white"}
          borderColor={isDirectory ? "blackAlpha.200" : "transparent"}
          borderRadius={isDirectory ? "lg" : "full"}
          h={LAYOUT.tapMinPx}
          w={LAYOUT.tapMinPx}
          minW={LAYOUT.tapMinPx}
          minH={LAYOUT.tapMinPx}
          flexShrink={0}
          _hover={{ bg: isDirectory ? "gray.50" : "gray.100" }}
        />
        <Check ifPresent={isAnyFilterPresent}>
          <Box
            position="absolute"
            top={1.5}
            right={1.5}
            w={2}
            h={2}
            borderRadius="full"
            bg="red.400"
            borderWidth="1px"
            borderColor="white"
            pointerEvents="none"
          />
        </Check>
      </Box>
    </Flex>
  );
}
