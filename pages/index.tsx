import * as React from "react";
import {
  Container,
  Box,
  Stack,
  ButtonGroup,
  Icon,
  Text,
  Wrap,
  Tag,
  useClipboard,
  VStack,
  Image,
  Button,
  useStatStyles
} from "@chakra-ui/react";
import { SEO } from "components/seo/seo";

import { FallInPlace } from "components/motion/fall-in-place";
import { Hero } from "components/hero";
import { Br } from "@saas-ui/react";
import { Em } from "components/typography";
import {
  FiArrowRight,
  FiShield, 
  FiClock, 
  FiDollarSign,
  FiCheck,
} from "react-icons/fi";
import { Features } from "components/features";
import { BackgroundGradient } from "components/gradients/background-gradient";
import { Faq } from "components/faq";
import { Pricing } from "components/pricing/pricing";

import { ButtonLink } from "components/button-link/button-link";
import { Testimonial, Testimonials } from "components/testimonials";
import faq from "data/faq";
import testimonials from "data/testimonials";
import pricing from "data/pricing";

import {
  Highlights,
  HighlightsItem,
} from "components/highlights";
import {
  AnnouncementBanner,
  IAnnouncementBannerProps
} from "components/announcement-banner";
import { SignupModal } from "components/profile";
import useApp from "components/context/app-context";

const Home: React.FC<{announcement: IAnnouncementBannerProps}> = (props) => {
  const { announcement } = props;
  return (
    <Box>
      <SEO
        title="SeifyLabs"
        description="The Escrow platform for the crypto community"
      />
      <AnnouncementBanner {...announcement} />
      <Box>
        <HeroSection />

        <HighlightsSection />

        <TestimonialsSection />

        <PricingSection />

        <FaqSection />
      </Box>
    </Box>
  );
};

const HeroSection: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { user } = useApp();
  return (
    <Box position="relative" overflow="hidden">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" pt={{ base: 40, lg: 60 }} pb="40">
        <Stack direction={{ base: "column", lg: "row" }} alignItems="center">
          <Hero
            id="home"
            justifyContent="flex-start"
            px="0"
            title={
              <FallInPlace>
                Secure Crypto

                <Br /> Escrow Platform
              </FallInPlace>
            }
            description={
              <FallInPlace delay={0.4} fontWeight="medium">
                Ensuring safe and reliable <Em>crypto transactions.</Em>
                <Br /> Protecting crypto holders from scams <Br />{" "}
                and making the space more trustworthy.
              </FallInPlace>
            }
          >
            <FallInPlace delay={0.8}>
            <div style={{ paddingTop: '16px', paddingBottom: '28px', display: 'flex', gap: '12px' }}>
              <Image src="/static/images/phantom.png" alt="Phantom" height={38} width={38}/>
              <Image src="/static/images/metamask.png" alt="MetaMask" height={38} width={38}/>
            </div>

              <ButtonGroup spacing={4} alignItems="center">
                {user ? (
                  <ButtonLink colorScheme="primary" size="lg" href='/dashboard'>
                    Go to dashboard
                  </ButtonLink>
                ) : (
                  <Button colorScheme="primary" size="lg" onClick={() => {
                    setOpen(true);
                  }}>
                    Sign up with wallet
                  </Button>
                )}
                <ButtonLink
                  size="lg"
                  href="https://demo.saas-ui.dev"
                  variant="outline"
                  rightIcon={
                    <Icon
                      as={FiArrowRight}
                      sx={{
                        transitionProperty: "common",
                        transitionDuration: "normal",
                        ".chakra-button:hover &": {
                          transform: "translate(5px)",
                        },
                      }}
                    />
                  }
                >
                  View demo
                </ButtonLink>
              </ButtonGroup>
            </FallInPlace>
          </Hero>
          <Box
            height="500px"
            position="absolute"
            display={{ base: "none", lg: "block" }}
            left={{ lg: "80%", xl: "60%" }}
            width="80vw"
            maxW="1100px"
            margin="0 auto"
          >
            <FallInPlace delay={1}>
              <Box overflow="hidden" height="100%">
                <Image
                  src="/static/images/dashboard 1.svg"
                  width={900}
                  alt="Screenshot of a ListPage in SeifyLabs"
                />
              </Box>
            </FallInPlace>
          </Box>
        </Stack>
      </Container>

      <Features
        id="benefits"
        columns={[1, 2, 4]}
        iconSize={4}
        innerWidth="container.xl"
        pt="20"
        features={[
          {
            title: "Secure",
            icon: FiCheck,
            description: "Your funds are safely stored in escrow until both parties are satisfied.",
            iconPosition: "left",
            delay: 0.6,
          },
          {
            title: "Trusted",
            icon: FiShield,
            description: "Our platform uses advanced encryption and security protocols.",
            iconPosition: "left",
            delay: 0.8,
          },
          {
            title: "Timely",
            icon: FiClock,
            description: "Efficient transactions with minimal waiting time for both parties.",
            iconPosition: "left",
            delay: 1,
          },
          {
            title: "Transparent",
            icon: FiDollarSign,
            description: "Clear and upfront fees, no hidden charges.",
            iconPosition: "left",
            delay: 1.1,
          },
        ]}
        reveal={FallInPlace}
      />
      <SignupModal open={open} setOpen={setOpen}/>
    </Box>
  );
};

const HighlightsSection = () => {
  const { value, onCopy, hasCopied } = useClipboard("yarn add @saas-ui/react");

  return (
    <Highlights id="features">
      <HighlightsItem colSpan={[1, null, 2]} title="Escrow Process">
        <VStack alignItems="flex-start" spacing="8">
          <Text color="muted" fontSize="xl">
            Get started with our secure escrow platform, ensuring smooth transactions between payers and payees. Each step is designed to facilitate transparency and trust.
          </Text>
        </VStack>
      </HighlightsItem>
      <HighlightsItem title="Assign Parties">
        <Text color="muted" fontSize="lg">
          Easily assign a payer and a payee to the transaction.
        </Text>
      </HighlightsItem>
      <HighlightsItem title="Define Scope of Work">
        <Text color="muted" fontSize="lg">
          Specify the scope of work, including deliverables and timeline.
        </Text>
      </HighlightsItem>
      <HighlightsItem title="Fund Escrow">
        <Text color="muted" fontSize="lg">
          Securely deposit the agreed amount into escrow.
        </Text>
      </HighlightsItem>
      <HighlightsItem title="Deliver and Review">
        <Text color="muted" fontSize="lg">
          The payee delivers the project, and the payer reviews the deliverables.
        </Text>
      </HighlightsItem>
      <HighlightsItem title="Mutual Agreement">
        <Text color="muted" fontSize="lg">
          Both parties agree on the satisfactory completion of the deliverables.
        </Text>
      </HighlightsItem>
      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Start your next project with confidence"
      >
        <Text color="muted" fontSize="lg">
          We took care of all your basic needs, so you can focus on building trust and ensuring secure transactions.
        </Text>
        <Wrap mt="8">
          {[
            "party assignment",
            "scope definition",
            "escrow funding",
            "project delivery",
            "review process",
            "mutual agreement",
            "secure transactions",
            "transparency",
            "trust",
            "documentation",
            "onboarding",
            "notifications",
            "compliance",
            "support",
            "reporting",
            "automation",
          ].map((value) => (
            <Tag
              key={value}
              variant="subtle"
              colorScheme="purple"
              rounded="full"
              px="3"
            >
              {value}
            </Tag>
          ))}
        </Wrap>
      </HighlightsItem>
    </Highlights>
  );
};

const TestimonialsSection = () => {
  const columns = React.useMemo(() => {
    return testimonials.items.reduce<Array<typeof testimonials.items>>(
      (columns, t, i) => {
        columns[i % 3].push(t);

        return columns;
      },
      [[], [], []]
    );
  }, []);

  return (
    <Testimonials
      title={testimonials.title}
      columns={[1, 2, 3]}
      innerWidth="container.xl"
    >
      <>
        {columns.map((column, i) => (
          <Stack key={i} spacing="8">
            {column.map((t, i) => (
              <Testimonial key={i} {...t} />
            ))}
          </Stack>
        ))}
      </>
    </Testimonials>
  );
};

const PricingSection = () => {
  return (
    <Pricing {...pricing}>
      <Text p="8" textAlign="center" color="muted">
      </Text>
    </Pricing>
  );
};

const FaqSection = () => {
  return <Faq {...faq} />;
};

export default Home;

export async function getStaticProps() {
  return {
    props: {
      announcement: {
        title: "Nº1 Escrow Platform for Crypto Transactions  🚀 ",
        description:
          '',
        href: "",
        action: false,
      },
    },
  };
}
