import { StepComponentProps } from '../../Steps';

export interface Step2Props extends StepComponentProps {
  availableHobbies: string[]; // props exclusivos de este paso
};

export const Step2 = (props: Step2Props): JSX.Element => {

  const { availableHobbies } = props;
  const myHobbies = props.getState<string[]>('hobbies', []);

  return (
    <div className='step'>
      Mis hobbies: {myHobbies.reduce((prev, curr) => `${prev}, ${curr}`, '')}
      <br />
      {availableHobbies.map(elem => (
        <button
          key={elem}
          onClick={() => props.setState<string[]>('hobbies', prev => {
            if (prev.some(e => e === elem)) {
              return prev.filter(e => e !== elem);
            }
            return [...prev, elem];
          }, [])}
        >
          {elem}
        </button>
      ))}
      <br />

      Edad:{' '}
      <input
        name='age'
        data-testid='age'
        value={props.getState<number>('age', 18)}
        onChange={(event) => props.setState<number>('age', parseInt(event.target.value), 18)}
      />
      <br />

      Last Name (duplicado, comprueba que cambia si lo modificas en otro lugar):{' '}
      <input
        name='lastname'
        data-testid='lastname'
        value={props.getState<string>('lastname', '')}
        onChange={(event) => props.setState('lastname', event.target.value, '')}
      />
      <br />

      {props.hasPrev() && <button onClick={props.prev}>Prev</button>}
      {props.hasNext() && <button onClick={props.next}>Next</button>}
    </div>
  );
};

export default Step2;