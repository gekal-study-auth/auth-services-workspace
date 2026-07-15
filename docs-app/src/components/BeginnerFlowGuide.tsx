import { actorExplanation, getBeginnerGuide } from "../lib/beginner-guides";
import type { Protocol } from "../lib/protocols";

export function BeginnerFlowGuide({ protocol }: { protocol: Protocol }) {
  const guide = getBeginnerGuide(protocol);
  return (
    <section className="beginnerGuide">
      <div className="beginnerHeading">
        <div>
          <p className="sectionLabel">はじめに / 全体の流れ</p>
          <h2>
            このフローで、
            <br />
            何をするの？
          </h2>
        </div>
        <div className="beginnerGoal">
          <small>このフローのゴール</small>
          <p>{guide.goal}</p>
        </div>
      </div>
      <div className="storyGrid">
        <article>
          <span>01</span>
          <small>まず全体像</small>
          <p>{guide.overview}</p>
        </article>
        <article>
          <span>02</span>
          <small>身近な例で考える</small>
          <p>{guide.metaphor}</p>
        </article>
        <article>
          <span>03</span>
          <small>最後にどうなる？</small>
          <p>{guide.result}</p>
        </article>
      </div>
      <div className="actorGuide">
        <div>
          <small>登場人物</small>
          <p>図では、縦の列ごとに担当者やシステムを分けています。</p>
        </div>
        {protocol.actors.map((actor) => (
          <article key={actor.id}>
            <span>{actor.name.slice(0, 1)}</span>
            <div>
              <strong>{actor.name}</strong>
              <p>{actorExplanation(actor)}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="howToRead">
        <span aria-hidden="true">→</span>
        <p>
          <strong>図の読み方:</strong>{" "}
          光る丸が今説明している通信です。自動再生を止めたいときは「Pause」を押し、気になる矢印を選んでください。
        </p>
      </div>
    </section>
  );
}
