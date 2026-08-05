import { Euler, Matrix4, Quaternion, Spherical, Vector3 } from "three";

import type { SceneCamera } from "@/types/scene";
import type { CameraPatch } from "@/store/sceneStore";

type Vec3 = [number, number, number];

/** Ниже этой дистанции точка орбиты сливается с камерой и вид перестаёт определяться. */
const MIN_DISTANCE = 1e-4;
const UP = new Vector3(0, 1, 0);

const _position = new Vector3();
const _target = new Vector3();
const _offset = new Vector3();
const _quaternion = new Quaternion();
const _euler = new Euler();
const _matrix = new Matrix4();
const _spherical = new Spherical();

/** Поворот по осям, эквивалентный взгляду из position в target. */
export function eulerFromLookAt(
  position: Vec3,
  target: Vec3,
  up: Vector3 = UP
): Vec3 {
  _matrix.lookAt(_position.fromArray(position), _target.fromArray(target), up);
  _euler.setFromQuaternion(_quaternion.setFromRotationMatrix(_matrix), "XYZ");
  return [_euler.x, _euler.y, _euler.z];
}

/**
 * Позиция, поворот, точка орбиты и сферические координаты описывают один и тот
 * же вид, но правят их порознь: панель — позицию и поворот, пресеты — углы,
 * CameraControls — позицию и точку орбиты. Остальное досчитываем здесь, иначе
 * вьюпорт получает конфликтующие поля и дёргает камеру.
 */
export function normalizeCameraPatch(
  camera: SceneCamera,
  patch: CameraPatch
): CameraPatch {
  const position = patch.transform?.position as Vec3 | undefined;
  const rotation = patch.transform?.rotation as Vec3 | undefined;
  const { target, azimuth, polar, dolly } = patch;

  // Позиция вместе с точкой орбиты — это снимок с контролов, он уже согласован.
  if (position !== undefined && target !== undefined) return patch;

  if (azimuth !== undefined || polar !== undefined || dolly !== undefined) {
    // Орбита вокруг точки взгляда: двигается позиция.
    _spherical
      .set(
        Math.max(dolly ?? camera.dolly ?? 1, MIN_DISTANCE), //null -> 1
        polar ?? camera.polar,
        azimuth ?? camera.azimuth
      )
      .makeSafe();
    _target.fromArray(target ?? camera.target);
    _position.setFromSpherical(_spherical).add(_target);
  } else if (rotation !== undefined) {
    // Поворот на месте: уезжает точка взгляда.
    _quaternion.setFromEuler(
      _euler.set(rotation[0], rotation[1], rotation[2], "XYZ")
    );
    _position.fromArray(position ?? (camera.transform.position as Vec3));
    _offset
      .set(0, 0, -1)
      .applyQuaternion(_quaternion)
      .multiplyScalar(Math.max(camera.dolly ?? 1, MIN_DISTANCE)); //null -> 1
    _target.copy(_position).add(_offset);
  } else if (position !== undefined) {
    _position.fromArray(position);
    _target.fromArray(camera.target);
  } else if (target !== undefined) {
    _position.fromArray(camera.transform.position);
    _target.fromArray(target);
  } else {
    // Вид не затронут: патчатся near/far/fov/zoom и прочее.
    return patch;
  }

  const nextPosition = _position.toArray() as Vec3;
  const nextTarget = _target.toArray() as Vec3;
  _spherical.setFromVector3(_offset.copy(_position).sub(_target));

  return {
    ...patch,
    transform: {
      ...patch.transform,
      position: nextPosition,
      rotation: eulerFromLookAt(nextPosition, nextTarget),
    },
    target: nextTarget,
    // Пришедшие углы сохраняем как есть: makeSafe сдвигает полюса на эпсилон,
    // и пресеты ракурса переставали узнавать свой вариант как активный.
    azimuth: azimuth ?? _spherical.theta,
    polar: polar ?? _spherical.phi,
    dolly: _spherical.radius,
  };
}
