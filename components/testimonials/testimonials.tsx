import { ResponsiveValue, SimpleGrid, Stack } from '@chakra-ui/react'
import {
  Section,
  ISectionProps,
  SectionTitle,
  ISectionTitleProps,
} from 'components/section'

export interface ITestimonialsProps
  extends Omit<ISectionProps, 'title'>,
    Pick<ISectionTitleProps, 'title' | 'description'> {
  columns?: ResponsiveValue<number>
}

export const Testimonials: React.FC<ITestimonialsProps> = (props) => {
  const { children, title, columns = [1, null, 2], ...rest } = props
  return (
    <Section {...rest}>
      <SectionTitle title={title} />
      <SimpleGrid columns={columns} spacing="8">
        {children}
      </SimpleGrid>
    </Section>
  )
}
