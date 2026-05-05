"use client";

import { ThemeProvider } from "@aws-amplify/ui-react";
import { appTheme } from "@/lib/amplify-theme";
import {
  Alert,
  Badge,
  Button,
  Card,
  CheckboxField,
  Divider,
  Flex,
  Heading,
  Loader,
  Pagination,
  PasswordField,
  Placeholder,
  Radio,
  RadioGroupField,
  Rating,
  SearchField,
  SelectField,
  SliderField,
  StepperField,
  SwitchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Text,
  TextAreaField,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Link,
  View,
} from "@aws-amplify/ui-react";
import { useState, useEffect } from "react";
import { applyTheme, getAppliedTheme, type Theme } from "@/lib/theme-utils";
import styles from "./components.module.css";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}

export default function ComponentsShowcase() {
  const [sliderValue, setSliderValue] = useState(40);
  const [stepperValue, setStepperValue] = useState(1);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [toggleValue, setToggleValue] = useState("left");
  const [currentPage, setCurrentPage] = useState(1);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getAppliedTheme());
  }, []);

  function handleThemeToggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <ThemeProvider theme={appTheme}>
      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <Flex justifyContent="space-between" alignItems="flex-start" wrap="wrap" gap="1rem">
            <div>
              <Heading level={1}>Component Showcase</Heading>
              <Text>
                All Amplify UI components rendered with the app theme. Every color
                references <code>globals.css</code> — change a CSS variable there
                and it updates everywhere.
              </Text>
            </div>
            <Button
              onClick={handleThemeToggle}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
            </Button>
          </Flex>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────────── */}
        <Section title="Alert">
          <Flex direction="column" gap="0.75rem">
            <Alert variation="info"    heading="Info">    This is an info alert.</Alert>
            <Alert variation="success" heading="Success"> Operation completed successfully.</Alert>
            <Alert variation="warning" heading="Warning"> Please review before continuing.</Alert>
            <Alert variation="error"   heading="Error">   Something went wrong.</Alert>
          </Flex>
        </Section>

        <Divider />

        {/* ── Badges ─────────────────────────────────────────────────── */}
        <Section title="Badge">
          <Flex gap="0.5rem" wrap="wrap">
            <Badge>Default</Badge>
            <Badge variation="info">Info</Badge>
            <Badge variation="success">Success</Badge>
            <Badge variation="warning">Warning</Badge>
            <Badge variation="error">Error</Badge>
          </Flex>
        </Section>

        <Divider />

        {/* ── Buttons ────────────────────────────────────────────────── */}
        <Section title="Button">
          <Flex gap="0.75rem" wrap="wrap" alignItems="center">
            <Button variation="primary">Primary</Button>
            <Button variation="link">Link</Button>
            <Button>Default</Button>
            <Button isDisabled>Disabled</Button>
            <Button isLoading loadingText="Loading…">Loading</Button>
            <Button variation="primary" size="small">Small</Button>
            <Button variation="primary" size="large">Large</Button>
          </Flex>
        </Section>

        <Divider />

        {/* ── Card ───────────────────────────────────────────────────── */}
        <Section title="Card">
          <Flex gap="1rem" wrap="wrap">
            <Card>
              <Heading level={5}>Default Card</Heading>
              <Text>Card content goes here.</Text>
            </Card>
            <Card variation="outlined">
              <Heading level={5}>Outlined Card</Heading>
              <Text>Card with an outlined border.</Text>
            </Card>
            <Card variation="elevated">
              <Heading level={5}>Elevated Card</Heading>
              <Text>Card with an elevated shadow.</Text>
            </Card>
          </Flex>
        </Section>

        <Divider />

        {/* ── Form Fields ────────────────────────────────────────────── */}
        <Section title="Form Fields">
          <Flex direction="column" gap="1rem" maxWidth="480px">
            <TextField
              label="Text Field"
              placeholder="Enter some text"
              descriptiveText="Helper text goes here"
            />
            <TextField
              label="Error State"
              placeholder="Invalid input"
              hasError
              errorMessage="This field is required"
            />
            <PasswordField
              label="Password Field"
              placeholder="Enter password"
            />
            <TextAreaField
              label="Text Area"
              placeholder="Enter a longer message…"
              rows={3}
            />
            <SearchField
              label="Search"
              placeholder="Search…"
              onClear={() => {}}
            />
            <SelectField label="Select Field">
              <option value="a">Option A</option>
              <option value="b">Option B</option>
              <option value="c">Option C</option>
            </SelectField>
            <CheckboxField
              label="I agree to the terms"
              name="terms"
              value="yes"
            />
            <RadioGroupField
              legend="Radio Group"
              name="radio-demo"
              defaultValue="one"
            >
              <Radio value="one">Option One</Radio>
              <Radio value="two">Option Two</Radio>
              <Radio value="three">Option Three</Radio>
            </RadioGroupField>
            <SliderField
              label={`Slider: ${sliderValue}`}
              min={0}
              max={100}
              value={sliderValue}
              onChange={setSliderValue}
            />
            <StepperField
              label="Stepper"
              min={0}
              max={10}
              step={1}
              value={stepperValue}
              onStepChange={setStepperValue}
            />
            <SwitchField
              label="Switch Field"
              isChecked={switchChecked}
              onChange={(e) => setSwitchChecked(e.target.checked)}
            />
          </Flex>
        </Section>

        <Divider />

        {/* ── Heading & Text ─────────────────────────────────────────── */}
        <Section title="Heading & Text">
          <Flex direction="column" gap="0.5rem">
            <Heading level={1}>Heading 1</Heading>
            <Heading level={2}>Heading 2</Heading>
            <Heading level={3}>Heading 3</Heading>
            <Heading level={4}>Heading 4</Heading>
            <Heading level={5}>Heading 5</Heading>
            <Heading level={6}>Heading 6</Heading>
            <Text>Regular body text.</Text>
            <Text variation="primary">Primary variation.</Text>
            <Text variation="secondary">Secondary variation.</Text>
            <Text variation="tertiary">Tertiary variation.</Text>
            <Text variation="error">Error variation.</Text>
            <Text variation="warning">Warning variation.</Text>
            <Text variation="success">Success variation.</Text>
            <Text variation="info">Info variation.</Text>
          </Flex>
        </Section>

        <Divider />

        {/* ── Link ───────────────────────────────────────────────────── */}
        <Section title="Link">
          <Flex gap="1rem" wrap="wrap">
            <Link href="#">Default link</Link>
            <Link href="#" isExternal>External link</Link>
          </Flex>
        </Section>

        <Divider />

        {/* ── Loader ─────────────────────────────────────────────────── */}
        <Section title="Loader">
          <Flex gap="1.5rem" alignItems="center">
            <Loader />
            <Loader variation="linear" />
            <Loader size="large" />
          </Flex>
        </Section>

        <Divider />

        {/* ── Pagination ─────────────────────────────────────────────── */}
        <Section title="Pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={8}
            siblingCount={1}
            onChange={(page) => page && setCurrentPage(page)}
          />
        </Section>

        <Divider />

        {/* ── Placeholder (skeleton) ─────────────────────────────────── */}
        <Section title="Placeholder (Skeleton)">
          <Flex direction="column" gap="0.5rem" maxWidth="400px">
            <Placeholder size="small" />
            <Placeholder />
            <Placeholder size="large" />
          </Flex>
        </Section>

        <Divider />

        {/* ── Rating ─────────────────────────────────────────────────── */}
        <Section title="Rating">
          <Flex gap="1rem" alignItems="center">
            <Rating value={3} maxValue={5} />
            <Rating value={4.5} maxValue={5} />
            <Rating value={5} maxValue={5} />
          </Flex>
        </Section>

        <Divider />

        {/* ── Table ──────────────────────────────────────────────────── */}
        <Section title="Table">
          <Table caption="Sample data table" highlightOnHover>
            <TableHead>
              <TableRow>
                <TableCell as="th">Name</TableCell>
                <TableCell as="th">Role</TableCell>
                <TableCell as="th">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: "Alice", role: "Admin",   status: "Active" },
                { name: "Bob",   role: "Editor",  status: "Inactive" },
                { name: "Carol", role: "Viewer",  status: "Active" },
              ].map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Divider />

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Section title="Tabs">
          <Tabs
            defaultValue="tab1"
            items={[
              { label: "Tab One",   value: "tab1", content: <Text>Content for Tab One.</Text> },
              { label: "Tab Two",   value: "tab2", content: <Text>Content for Tab Two.</Text> },
              { label: "Tab Three", value: "tab3", content: <Text>Content for Tab Three.</Text> },
            ]}
          />
        </Section>

        <Divider />

        {/* ── ToggleButton ───────────────────────────────────────────── */}
        <Section title="ToggleButton">
          <ToggleButtonGroup
            value={toggleValue}
            isExclusive
            onChange={(val) => val && setToggleValue(val as string)}
          >
            <ToggleButton value="left">Left</ToggleButton>
            <ToggleButton value="center">Center</ToggleButton>
            <ToggleButton value="right">Right</ToggleButton>
          </ToggleButtonGroup>
        </Section>

        <Divider />

        {/* ── View ───────────────────────────────────────────────────── */}
        <Section title="View (base primitive)">
          <View
            backgroundColor="var(--surface)"
            borderRadius="0.5rem"
            padding="1rem"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="var(--border)"
          >
            <Text>This is a <code>View</code> — the base primitive for all layout.</Text>
          </View>
        </Section>
      </div>
    </ThemeProvider>
  );
}
