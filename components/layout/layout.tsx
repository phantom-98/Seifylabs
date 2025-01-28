import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

import { SkipNavContent, SkipNavLink } from '@chakra-ui/skip-nav'

import { Header, IHeaderProps } from './header'
import { Footer, IFooterProps } from './footer'

interface ILayoutProps {
  children: ReactNode
  headerProps: IHeaderProps
  footerProps: IFooterProps
}

export const Layout: React.FC<ILayoutProps> = (props) => {
  const { children, headerProps, footerProps } = props
  return (
    <Box>
      <SkipNavLink>Skip to content</SkipNavLink>
      <Header {...headerProps} />
      <Box as="main">
        <SkipNavContent />
        {children}
      </Box>
      <Footer {...footerProps} />
    </Box>
  )
}
