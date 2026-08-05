import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BloodGroups,
  BusinessTypes,
  Gender,
  Localities,
  type KeyValuePair,
} from "@/utils/constants";
import { map } from "lodash";
import { addFilter, removeFilter } from "@/modules/directory/screens/SearchScreen/redux/searchSlice";
import type { RootState } from "@/store";
import { BackButton } from "@/components/ui/BackButton";
import { sortByKey } from "@/utils/utils";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

export default function FiltersScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filter = useSelector((state: RootState) => state?.search?.filter);

  const [selectedBloodGroup, setSelectedBloodGroup] = useState<KeyValuePair | null>(
    (filter?.bloodGroup as KeyValuePair | undefined) ?? null
  );
  const [age, setAge] = useState(filter?.age || { max: 100, min: 0 });
  const [showUnmarried, setShowUnmarried] = useState(filter?.showUnmarried);
  const [locality, setLocality] = useState(filter?.locality ?? "");
  const [businessType, setBusinessType] = useState(filter?.businessType ?? "");
  const [gender, setGender] = useState(filter?.gender ?? "");

  const sortedLocalities = useMemo(() => sortByKey(Localities, "label"), []);

  const onPressBlood = (bg: KeyValuePair) => {
    if (selectedBloodGroup?.id === bg.id) setSelectedBloodGroup(null);
    else setSelectedBloodGroup(bg);
  };

  const onApply = () => {
    dispatch(
      addFilter({
        bloodGroup: selectedBloodGroup ?? undefined,
        locality,
        businessType,
        showUnmarried,
        age,
        gender: gender || undefined,
      })
    );
    navigate(-1);
  };

  const onClear = () => {
    dispatch(removeFilter());
    navigate(-1);
  };

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={3}
        py={3}
        bg="gray.900"
        color="white"
        position="sticky"
        top={0}
        zIndex={10}
        boxShadow="sm"
      >
        <BackButton appearance="light" />
        <Heading size="sm" fontWeight="semibold" letterSpacing="tight">
          Filters
        </Heading>
        <Button variant="ghost" size="sm" color="blue.300" _hover={{ bg: "whiteAlpha.200" }} onClick={onClear}>
          Clear all
        </Button>
      </Flex>

      <Box flex={1} overflowY="auto" pb="calc(88px + env(safe-area-inset-bottom, 0px))">
        <Container maxW="md" py={6} px={4}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                Blood group
              </Text>
              <Wrap spacing={2}>
                {BloodGroups.map((bg) => (
                  <WrapItem key={bg.id}>
                    <Button
                      size="sm"
                      variant={selectedBloodGroup?.id === bg.id ? "solid" : "outline"}
                      colorScheme="brand"
                      borderRadius="full"
                      onClick={() => onPressBlood(bg)}
                      fontWeight="medium"
                    >
                      {bg.label}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            <Divider borderColor="gray.200" />

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Locality
              </FormLabel>
              <Select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                bg="white"
                borderRadius="lg"
                size="lg"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.300" }}
              >
                <option value="">Any</option>
                {sortedLocalities.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Business type
              </FormLabel>
              <Select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                bg="white"
                borderRadius="lg"
                size="lg"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.300" }}
              >
                <option value="">Any</option>
                {map(BusinessTypes, (b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Gender
              </FormLabel>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                bg="white"
                borderRadius="lg"
                size="lg"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.300" }}
              >
                <option value="">Any</option>
                {Gender.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Age range
              </FormLabel>
              <HStack spacing={3}>
                <Input
                  type="number"
                  value={age.min}
                  onChange={(e) => setAge({ ...age, min: Number(e.target.value) })}
                  bg="white"
                  borderRadius="lg"
                  size="lg"
                  borderColor="gray.200"
                  placeholder="Min"
                />
                <Text color="gray.500" fontSize="sm">
                  to
                </Text>
                <Input
                  type="number"
                  value={age.max}
                  onChange={(e) => setAge({ ...age, max: Number(e.target.value) })}
                  bg="white"
                  borderRadius="lg"
                  size="lg"
                  borderColor="gray.200"
                  placeholder="Max"
                />
              </HStack>
            </FormControl>

            <Checkbox
              isChecked={!!showUnmarried}
              onChange={(e) => setShowUnmarried(e.target.checked)}
              colorScheme="brand"
              size="lg"
              spacing={3}
            >
              <Text fontSize="md">Show only unmarried</Text>
            </Checkbox>
          </VStack>
        </Container>
      </Box>

      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTopWidth="1px"
        borderColor="gray.200"
        px={4}
        py={3}
        pb="calc(12px + env(safe-area-inset-bottom, 0px))"
        boxShadow="0 -4px 20px rgba(0,0,0,0.06)"
      >
        <Button width="full" size="lg" borderRadius="xl" onClick={onApply} fontWeight="semibold">
          Apply filters
        </Button>
      </Box>
    </Flex>
  );
}
