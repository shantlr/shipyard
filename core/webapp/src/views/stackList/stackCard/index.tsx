import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'components/button';
import { BaseCard } from 'components/card';
import { Text } from 'components/text';
import { API } from 'configs';
import { Stack } from 'configs/types';
import { useStackServiceStates, useSubscribeServiceStates } from 'hooks/query';
import { map } from 'lodash';
import { useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

const StackCardContainer = styled(BaseCard)<{ active?: boolean }>`
  padding: ${(props) => props.theme.space.lg};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  margin-bottom: ${(props) => props.theme.space.md};

  cursor: pointer;
  transition: all 0.5s;

  :hover {
    opacity: 1;
    box-shadow: ${(props) => props.theme.shadow.md};
  }
`;

const StackHeader = styled.div`
  display: flex;
  width: 100%;
  overflow: hidden;
  flex-wrap: nowrap;
  margin-bottom: ${(props) => props.theme.space.md};
`;
const StackHeaderActions = styled.div``;
const StackTitle = styled.div`
  flex-grow: 1;
  ${(props) => props.theme.color.title};
  font-weight: bold;
`;
const ServiceList = styled.div`
  display: flex;
`;

// const ServiceContainer = styled.div`
//   background-color: white;
//   color: ${(props) => props.theme.color.text};
//   margin-right: ${(props) => props.theme.space.md};
//   border-radius: ${(props) => props.theme.borderRadius.lg};
//   padding: ${(props) => props.theme.space.md};
//   cursor: pointer;

//   transition: all 0.5s;
//   :hover {
//     filter: brightness(1.1);
//     box-shadow: ${(props) => props.theme.shadow.md};
//   }
//   :active {
//     opacity: 0.8;
//   }
// `;

const stateCss = {
  running: css`
    border-color: transparent;
    background-color: ${(props) => props.theme.color.success};
    color: ${(props) => props.theme.color.successColor};
  `,
  exited: css`
    border-color: transparent;
    background-color: ${(props) => props.theme.color.mainBg};
    color: ${(props) => props.theme.color.text};
  `,
};

const ServiceItem = styled.div<{ state?: keyof typeof stateCss }>`
  margin-right: ${(props) => props.theme.space.md};
  padding: ${(props) => props.theme.space.sm};
  border-radius: ${(props) => props.theme.borderRadius.md};
  transition: all 0.3s;
  min-width: 65px;
  display: flex;
  justify-content: space-between;
  color: ${(props) => props.theme.color.text};
  ${(props) => (props.state ? stateCss[props.state] : null)};

  border: 1px solid ${(props) => props.theme.color.mainBg};

  :hover {
    border-color: transparent;
    color: ${(props) => props.theme.color.text};
    background-color: ${(props) => props.theme.color.mainHighlightBg};
    box-shadow: ${(props) => props.theme.shadow.md};
  }
`;

export const StackCard = ({
  active,
  stack,
}: {
  active: boolean;
  stack: Stack;
}) => {
  const { mutate: runStack } = useMutation(() =>
    API.stack.run({
      name: stack.name,
    })
  );
  const { data: serviceStates } = useStackServiceStates(stack.name);
  useSubscribeServiceStates(stack.name);

  return (
    <StackCardContainer active={active}>
      <StackHeader>
        <StackTitle>{stack.name}</StackTitle>
        <StackHeaderActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              runStack();
            }}
          >
            <FontAwesomeIcon icon={faPlay} />
          </Button>
        </StackHeaderActions>
      </StackHeader>
      <ServiceList>
        {map(stack.spec.services, (service, serviceKey) => (
          <ServiceItem
            key={serviceKey}
            state={
              serviceStates && serviceStates[serviceKey]
                ? serviceStates[serviceKey].current_task_state
                : 'off'
            }
          >
            <Text style={{ marginRight: 5 }}>{serviceKey}</Text>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <FontAwesomeIcon icon={faPlay} />
            </Button>
          </ServiceItem>
          // <Link
          //   key={serviceKey}
          //   to={`/stack/${stack.name}/service/${serviceKey}`}
          // >
          // <ServiceContainer kLinkey={serviceKey}>{serviceKey}</ServiceContainer>
          // </Link>
        ))}
      </ServiceList>
    </StackCardContainer>
  );
};
