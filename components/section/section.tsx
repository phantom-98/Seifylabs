import {
  chakra,
  useStyleConfig,
  omitThemingProps,
  Container,
  ThemingProps,
  StyleProps,
  HTMLChakraProps,
} from '@chakra-ui/react'

export interface ISectionProps
  extends HTMLChakraProps<'div'>,
    ThemingProps<'Section'> {
  children: React.ReactNode
  innerWidth?: StyleProps['width']
}

export const Section: React.FC<ISectionProps> = (props) => {
  const { children, innerWidth = 'container.lg', className, ...rest } = props
  const styles = useStyleConfig('Section', rest)

  const ownProps = omitThemingProps(rest)

  return (
    <chakra.div __css={styles} {...ownProps}>
      <Container height="full" maxW={innerWidth}>
        {children}
      </Container>
    </chakra.div>
  )
}
