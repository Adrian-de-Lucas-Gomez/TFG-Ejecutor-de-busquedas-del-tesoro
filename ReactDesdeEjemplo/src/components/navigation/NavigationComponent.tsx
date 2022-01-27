import { NavigationComponentProps } from '../Steps';

export const NavigationComponent = (props: NavigationComponentProps): JSX.Element => {
  return (
    <div>
      <button data-testid='global-prev' onClick={props.prev}>
        Global Previous
      </button>
      <button data-testid='global-next' onClick={props.next}>
        Global Next
      </button>
    </div>
  );
};

export default NavigationComponent;