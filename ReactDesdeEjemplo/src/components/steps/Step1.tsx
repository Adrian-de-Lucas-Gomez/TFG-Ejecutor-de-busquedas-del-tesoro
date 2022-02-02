import { StepComponentProps } from '../Steps';

const Step1 = (props: StepComponentProps): JSX.Element => {

  return (
    <div className='step'>
      First Name:{' '}
      <input
        name='firstname'
        data-testid='firstname'
        value={props.getState<string>('firstname', '')}
        onChange={(event) => props.setState<string>('firstname', event.target.value, '')}
      />
      <br />
      Last Name:{' '}
      <input
        name='lastname'
        data-testid='lastname'
        value={props.getState<string>('lastname', '')}
        onChange={(event) => props.setState<string>('lastname', event.target.value, '')}
      />
      <br />
      {props.hasPrev() && <button onClick={props.prev}>Prev</button>}
      {props.hasNext() && <button onClick={props.next}>Next</button>}
    </div>
  );
};

export default Step1;