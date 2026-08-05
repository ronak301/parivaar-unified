import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { IconChevronLeft } from "@/components/ui/NavIcons";
import { LAYOUT } from "@/theme/layout";
import SearchBarContainer from "@/modules/directory/components/SearchBarContainer";
import { Box, Flex, IconButton, Image, Text } from "@chakra-ui/react";

export function CommunityDirectoryHeader() {
  const navigate = useNavigate();
  const selectedCommunity = useSelector((s: RootState) => s.community.selectedCommunity);
  const logoUrl = resolveMediaUrl(selectedCommunity?.logo);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [selectedCommunity?.id, selectedCommunity?.logo]);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={30}
      bg="gray.900"
      color="white"
      flexShrink={0}
      boxShadow="sm"
    >
      <Flex
        minH={LAYOUT.headerHeightPx}
        px={2.5}
        align="center"
        justify="space-between"
        gap={2}
      >
        <Flex align="center" gap={2} minW={0} flex={1}>
          <IconButton
            aria-label="Back to communities"
            icon={<IconChevronLeft size={22} color="#fff" />}
            onClick={() => navigate("/community/all")}
            variant="ghost"
            color="white"
            boxSize={LAYOUT.tapMinPx}
            minW={LAYOUT.tapMinPx}
            _hover={{ bg: "whiteAlpha.200" }}
          />
          {logoUrl && !logoFailed ? (
            <Image
              src={logoUrl}
              alt=""
              boxSize="32px"
              borderRadius="md"
              objectFit="cover"
              flexShrink={0}
              onError={() => setLogoFailed(true)}
            />
          ) : null}
          <Text
            fontSize="15px"
            fontWeight="semibold"
            noOfLines={1}
            minW={0}
            flex={1}
          >
            {selectedCommunity?.name ?? ""}
          </Text>
        </Flex>
      </Flex>

      <Box
        w="100%"
        bg="white"
        px={LAYOUT.searchFieldInsetXPx}
        pt={LAYOUT.searchFieldInsetTopPx}
        pb={LAYOUT.searchFieldInsetBottomPx}
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
      >
        <SearchBarContainer variant="directory" />
      </Box>
    </Box>
  );
}
